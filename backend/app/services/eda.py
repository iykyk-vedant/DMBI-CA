"""Exploratory Data Analysis (EDA) Service.
Computes retail sales distributions, monthly trends, top products by invoice,
and scope justification metrics for CA1 Visualisation #1 and dashboard charts.
"""

import sys
import json
from pathlib import Path
from typing import Dict, Any, List

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
import numpy as np

from app.config import (
    RAW_PARQUET_PATH,
    BASKETS_PARQUET_PATH,
    LABEL_MAP_PATH,
    EDA_SUMMARY_PATH
)


def load_label_map() -> Dict[str, str]:
    if LABEL_MAP_PATH.exists():
        with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def compute_top_products(baskets_df: pd.DataFrame, label_map: Dict[str, str], top_n: int = 10) -> List[Dict[str, Any]]:
    """CA1 Visualisation #1: Top products ranked by number of valid UK invoices containing each product."""
    product_invoices: Dict[str, int] = {}
    for items in baskets_df["items"]:
        for code in items:
            product_invoices[code] = product_invoices.get(code, 0) + 1

    sorted_products = sorted(product_invoices.items(), key=lambda x: x[1], reverse=True)[:top_n]
    total_baskets = len(baskets_df)

    top_list = []
    for rank, (code, count) in enumerate(sorted_products, 1):
        top_list.append({
            "rank": rank,
            "stock_code": code,
            "label": label_map.get(code, f"Item {code}"),
            "invoice_count": int(count),
            "share_of_baskets_pct": round((count / total_baskets) * 100, 2)
        })
    return top_list


def compute_monthly_trend(baskets_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Invoices per month across Dec 2010 – Dec 2011, noting partial observation in Dec 2011."""
    df = baskets_df.copy()
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df["YearMonth"] = df["InvoiceDate"].dt.to_period("M").astype(str)

    monthly_counts = df.groupby("YearMonth")["InvoiceNo"].nunique().to_dict()
    trend = []
    for ym, count in sorted(monthly_counts.items()):
        is_partial = (ym == "2011-12")
        trend.append({
            "month": ym,
            "invoice_count": int(count),
            "is_partial": is_partial,
            "note": "Partial month (ends Dec 9, 2011)" if is_partial else "Full calendar month"
        })
    return trend


def compute_basket_size_distribution(baskets_df: pd.DataFrame) -> Dict[str, Any]:
    """Basket size histogram and descriptive statistics."""
    sizes = baskets_df["basket_size"].values
    bins = [2, 5, 10, 20, 50, 100, 200, 500, int(sizes.max()) + 1]
    labels = ["2-4", "5-9", "10-19", "20-49", "50-99", "100-199", "200-499", "500+"]

    binned = pd.cut(sizes, bins=bins, labels=labels, right=False)
    counts = pd.Series(binned).value_counts(sort=False).to_dict()

    histogram = [{"bin": str(b), "count": int(counts.get(b, 0))} for b in labels]

    stats = {
        "mean": round(float(np.mean(sizes)), 2),
        "median": float(np.median(sizes)),
        "std": round(float(np.std(sizes)), 2),
        "min": int(np.min(sizes)),
        "max": int(np.max(sizes)),
        "p25": float(np.percentile(sizes, 25)),
        "p75": float(np.percentile(sizes, 75))
    }
    return {"histogram": histogram, "stats": stats}


def compute_country_share(raw_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Country share in raw dataset to justify UK-only scope."""
    country_counts = raw_df["Country"].value_counts()
    total = len(raw_df)

    share_list = []
    for rank, (country, count) in enumerate(country_counts.head(10).items(), 1):
        share_list.append({
            "rank": rank,
            "country": str(country),
            "records": int(count),
            "share_pct": round((count / total) * 100, 2)
        })
    others_count = total - sum(item["records"] for item in share_list)
    if others_count > 0:
        share_list.append({
            "rank": len(share_list) + 1,
            "country": "Other Countries (28+)",
            "records": int(others_count),
            "share_pct": round((others_count / total) * 100, 2)
        })
    return share_list


def compute_raw_distribution_outliers(raw_df: pd.DataFrame) -> Dict[str, Any]:
    """Demonstrates extreme negative and positive outliers in Quantity and UnitPrice
    to provide analytical justification for data cleaning rules.
    """
    q = raw_df["Quantity"]
    p = raw_df["UnitPrice"]

    return {
        "quantity": {
            "min": int(q.min()),
            "max": int(q.max()),
            "negative_count": int((q < 0).sum()),
            "zero_count": int((q == 0).sum()),
            "extreme_high_count_gt_1000": int((q > 1000).sum())
        },
        "unit_price": {
            "min": float(p.min()),
            "max": float(p.max()),
            "negative_count": int((p < 0).sum()),
            "zero_count": int((p == 0).sum()),
            "extreme_high_count_gt_500": int((p > 500).sum())
        }
    }


def run_eda_analysis() -> Dict[str, Any]:
    """Computes all EDA summaries and persists to results/eda_summary.json."""
    raw_df = pd.read_parquet(RAW_PARQUET_PATH)
    baskets_df = pd.read_parquet(BASKETS_PARQUET_PATH)
    label_map = load_label_map()

    top_products = compute_top_products(baskets_df, label_map, top_n=10)
    monthly_trend = compute_monthly_trend(baskets_df)
    basket_sizes = compute_basket_size_distribution(baskets_df)
    country_share = compute_country_share(raw_df)
    outliers = compute_raw_distribution_outliers(raw_df)

    summary = {
        "top_products": top_products,
        "monthly_trend": monthly_trend,
        "basket_sizes": basket_sizes,
        "country_share": country_share,
        "raw_outliers": outliers
    }

    EDA_SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(EDA_SUMMARY_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("EDA Analysis complete: saved to", EDA_SUMMARY_PATH)
    return summary


if __name__ == "__main__":
    run_eda_analysis()
