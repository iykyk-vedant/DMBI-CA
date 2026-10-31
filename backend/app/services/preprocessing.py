"""Preprocessing Service for CA2 Market Basket Analysis.
Implements the 11-step reproducible data preparation pipeline specified in ANTIGRAVITY_SPEC.md.
Tracks exact rows removed at each step into a structured preprocessing log.
"""

import json
import re
import sys
from pathlib import Path

# Add backend directory to sys.path so app imports work when run directly
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List

from app.config import (
    RAW_DATASET_PATH,
    RAW_PARQUET_PATH,
    BASKETS_PARQUET_PATH,
    BASKET_MATRIX_PARQUET_PATH,
    LABEL_MAP_PATH,
    RAW_PROFILE_PATH,
    PREPROCESSING_LOG_PATH,
    FINAL_COUNTS_PATH,
    MIN_SUPPORT_FLOOR,
    CA1_RAW_PROFILE_REFERENCE,
    PROCESSED_DATA_DIR,
    RESULTS_DIR
)

NON_PRODUCT_EXACT_CODES = {
    "POST", "DOT", "M", "BANK CHARGES", "AMAZONFEE",
    "CRUK", "C2", "S", "B", "D", "PADS"
}
VALID_STOCK_CODE_REGEX = re.compile(r"^\d{5}[A-Za-z]*$")


def load_raw_dataframe(force_excel: bool = False) -> pd.DataFrame:
    """Loads the raw dataframe from parquet cache if present, otherwise reads Excel
    and caches to parquet for fast subsequent runs.
    """
    if RAW_PARQUET_PATH.exists() and not force_excel:
        print(f"Loading cached raw dataset from {RAW_PARQUET_PATH}...")
        return pd.read_parquet(RAW_PARQUET_PATH)

    if not RAW_DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {RAW_DATASET_PATH}.\n"
            f"Please run 'python backend/scripts/download_dataset.py' or manually place 'Online Retail.xlsx' in {RAW_DATASET_PATH.parent}."
        )

    print(f"Reading raw Excel file: {RAW_DATASET_PATH} (this may take a few moments)...")
    df = pd.read_excel(RAW_DATASET_PATH)
    
    # Standardize column names if needed
    df.columns = [c.strip() for c in df.columns]

    # Convert text columns to pandas string dtype (preserves NAs and avoids pyarrow int/str mixed error)
    df["InvoiceNo"] = df["InvoiceNo"].astype("string")
    df["StockCode"] = df["StockCode"].astype("string")
    df["Description"] = df["Description"].astype("string")
    df["Country"] = df["Country"].astype("string")

    RAW_PARQUET_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(RAW_PARQUET_PATH, index=False)
    print(f"Cached raw dataframe to {RAW_PARQUET_PATH} ({df.shape[0]} rows, {df.shape[1]} columns)")
    return df


def generate_raw_profile(df: pd.DataFrame) -> Dict[str, Any]:
    """Step 1 Profile: computes exact counts and missing stats directly from the downloaded file
    and aligns side-by-side with CA1 reference figures.
    """
    raw_invoices = df["InvoiceNo"].astype(str).str.strip()
    raw_stockcodes = df["StockCode"].astype(str).str.strip()
    
    computed_profile = {
        "total_records": int(len(df)),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "distinct_invoices": int(raw_invoices.nunique()),
        "distinct_products": int(raw_stockcodes.nunique()),
        "distinct_customers": int(df["CustomerID"].dropna().nunique()),
        "countries_represented": int(df["Country"].dropna().nunique()),
        "missing_counts": {col: int(count) for col, count in df.isna().sum().items()},
        "date_min": str(df["InvoiceDate"].min()),
        "date_max": str(df["InvoiceDate"].max()),
    }

    profile_comparison = {
        "computed": computed_profile,
        "ca1_reference": CA1_RAW_PROFILE_REFERENCE,
        "discrepancy_explanation": (
            "Computed figures represent the exact counts parsed from the official UCI Online Retail.xlsx dataset. "
            "CA1 reference figures were based on preliminary published exploration reports as noted in CA1 §3.5. "
            "Both are presented side by side for full academic transparency."
        )
    }

    RAW_PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(RAW_PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(profile_comparison, f, indent=2)

    return profile_comparison


def run_preprocessing_pipeline() -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, str], List[Dict[str, Any]]]:
    """Executes the full 11-step preprocessing pipeline.
    Returns:
        (baskets_df, boolean_basket_matrix, label_map, log_entries)
    """
    df = load_raw_dataframe()
    generate_raw_profile(df)

    log: List[Dict[str, Any]] = []

    def record_step(step_num: int, rule_name: str, desc: str, df_before: pd.DataFrame, df_after: pd.DataFrame, meta: Dict[str, Any] = None):
        rows_before = len(df_before)
        rows_after = len(df_after)
        rows_removed = rows_before - rows_after
        entry = {
            "step": step_num,
            "rule": rule_name,
            "description": desc,
            "rows_before": rows_before,
            "rows_after": rows_after,
            "rows_removed": rows_removed,
            "metadata": meta or {}
        }
        log.append(entry)
        print(f"Step {step_num:02d} [{rule_name}]: {rows_before} -> {rows_after} (removed {rows_removed})")

    # Step 1: Initial raw data loaded
    log.append({
        "step": 1,
        "rule": "Load and inspect",
        "description": "Initial raw dataset loaded from UCI Online Retail repository",
        "rows_before": len(df),
        "rows_after": len(df),
        "rows_removed": 0,
        "metadata": {"initial_shape": list(df.shape)}
    })

    # Step 2: Drop missing InvoiceNo or StockCode
    # Keep missing CustomerID. Missing Description handled via label map.
    curr_df = df.copy()
    step2_df = curr_df.dropna(subset=["InvoiceNo", "StockCode"])
    record_step(2, "Missing keys filter", "Drop rows missing InvoiceNo or StockCode. Keep missing CustomerID", curr_df, step2_df)
    curr_df = step2_df

    # Step 3: Cancellations (InvoiceNo starts with 'C')
    invoice_str = curr_df["InvoiceNo"].astype(str).str.strip()
    is_cancellation = invoice_str.str.startswith("C", na=False)
    step3_df = curr_df[~is_cancellation]
    record_step(3, "Cancellation filter", "Drop completed cancellation invoices (InvoiceNo prefix 'C')", curr_df, step3_df)
    curr_df = step3_df

    # Step 4: Invalid lines (Quantity <= 0 and UnitPrice <= 0 separately logged)
    q_nonpos = curr_df["Quantity"] <= 0
    p_nonpos = curr_df["UnitPrice"] <= 0
    invalid_lines = q_nonpos | p_nonpos
    meta_step4 = {
        "quantity_le_zero_count": int(q_nonpos.sum()),
        "unitprice_le_zero_count": int(p_nonpos.sum()),
        "both_le_zero_count": int((q_nonpos & p_nonpos).sum())
    }
    step4_df = curr_df[~invalid_lines]
    record_step(4, "Invalid values filter", "Drop non-positive Quantity (<= 0) and UnitPrice (<= 0)", curr_df, step4_df, meta_step4)
    curr_df = step4_df

    # Step 5: Non-product entries (POST, DOT, BANK CHARGES, vouchers, non-matching regex)
    # Format stock code
    curr_df["StockCode"] = curr_df["StockCode"].astype(str).str.strip()
    codes_upper = curr_df["StockCode"].str.upper()

    is_non_product_code = codes_upper.isin(NON_PRODUCT_EXACT_CODES)
    is_voucher = codes_upper.str.startswith("GIFT_0001", na=False)
    matches_regex = curr_df["StockCode"].apply(lambda s: bool(VALID_STOCK_CODE_REGEX.match(s)))

    to_exclude = is_non_product_code | is_voucher | (~matches_regex)
    removed_stock_counts = curr_df[to_exclude]["StockCode"].value_counts().head(20).to_dict()

    step5_df = curr_df[~to_exclude]
    record_step(
        5,
        "Non-product entries filter",
        "Drop non-product entries (POST, DOT, BANK CHARGES, fees, manual adjustments, invalid code patterns)",
        curr_df,
        step5_df,
        {"top_removed_codes": removed_stock_counts}
    )
    curr_df = step5_df

    # Step 6: Exact duplicate records
    step6_df = curr_df.drop_duplicates()
    record_step(6, "Exact duplicates filter", "Drop identical duplicate rows across all fields", curr_df, step6_df)
    curr_df = step6_df

    # Step 7: Text standardization and StockCode -> Label map
    # Clean description: strip, collapse spaces, uppercase
    curr_df["Description"] = (
        curr_df["Description"]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
        .str.upper()
    )

    # Build StockCode -> canonical readable label using mode description
    label_map: Dict[str, str] = {}
    grouped_desc = curr_df[curr_df["Description"] != ""].groupby("StockCode")["Description"].agg(
        lambda s: s.mode().iloc[0] if not s.mode().empty else s.iloc[0]
    )
    for code, desc in grouped_desc.items():
        label_map[str(code)] = str(desc)

    # For any remaining stock code without description, provide fallback
    all_codes = curr_df["StockCode"].unique()
    for code in all_codes:
        if code not in label_map:
            label_map[str(code)] = f"Item {code}"

    # Log text standardization
    log.append({
        "step": 7,
        "rule": "Text cleaning & Canonical labels",
        "description": "Standardize product descriptions and map each distinct StockCode to its most frequent description",
        "rows_before": len(curr_df),
        "rows_after": len(curr_df),
        "rows_removed": 0,
        "metadata": {"distinct_products_mapped": len(label_map)}
    })
    print(f"Step 07 [Text cleaning & Canonical labels]: Mapped {len(label_map)} distinct products")

    # Step 8: United Kingdom scope filter
    curr_df["Country"] = curr_df["Country"].astype(str).str.strip()
    is_uk = curr_df["Country"] == "United Kingdom"
    step8_df = curr_df[is_uk]
    record_step(8, "United Kingdom scope filter", "Restrict analysis scope to UK invoices only (as pre-registered in CA1)", curr_df, step8_df)
    curr_df = step8_df

    # Step 9: Transaction Grouping into Baskets
    # Group by InvoiceNo -> set of unique StockCodes
    baskets_series = curr_df.groupby("InvoiceNo")["StockCode"].apply(lambda s: sorted(list(set(s))))
    invoice_dates = curr_df.groupby("InvoiceNo")["InvoiceDate"].min()

    baskets_df = pd.DataFrame({
        "InvoiceNo": baskets_series.index.astype(str),
        "items": baskets_series.values,
        "basket_size": [len(items) for items in baskets_series.values],
        "InvoiceDate": invoice_dates.values
    })

    total_valid_baskets = len(baskets_df)
    log.append({
        "step": 9,
        "rule": "Basket grouping",
        "description": "Group completed UK transactions by InvoiceNo into sets of distinct StockCodes",
        "rows_before": len(curr_df),
        "rows_after": total_valid_baskets,
        "rows_removed": 0,
        "metadata": {"total_valid_baskets": total_valid_baskets}
    })
    print(f"Step 09 [Basket grouping]: Created {total_valid_baskets} unique transaction baskets")

    # Step 10: Basket-size filter (>= 2 items)
    # Exclude 1-item baskets from rule mining
    multi_baskets_df = baskets_df[baskets_df["basket_size"] >= 2].copy()
    baskets_removed_single = total_valid_baskets - len(multi_baskets_df)
    log.append({
        "step": 10,
        "rule": "Basket-size filter (>= 2 items)",
        "description": "Drop single-item baskets for association rule mining (a 1-item basket cannot contain co-purchases)",
        "rows_before": total_valid_baskets,
        "rows_after": len(multi_baskets_df),
        "rows_removed": baskets_removed_single,
        "metadata": {
            "total_valid_baskets": total_valid_baskets,
            "baskets_ge_2": len(multi_baskets_df),
            "single_item_baskets_removed": baskets_removed_single,
            "support_denominator_chosen": "baskets_ge_2"
        }
    })
    print(f"Step 10 [Basket-size filter]: {total_valid_baskets} -> {len(multi_baskets_df)} (removed {baskets_removed_single} single-item baskets)")

    # Step 11: One-Hot Encoding with Frequency Pre-filtering (items reaching support floor)
    # Determine item frequencies across multi-item baskets
    item_counts: Dict[str, int] = {}
    n_multi_baskets = len(multi_baskets_df)
    for items in multi_baskets_df["items"]:
        for it in items:
            item_counts[it] = item_counts.get(it, 0) + 1

    min_count_floor = int(np.ceil(MIN_SUPPORT_FLOOR * n_multi_baskets))
    eligible_items = sorted([it for it, cnt in item_counts.items() if cnt >= min_count_floor])

    log.append({
        "step": 11,
        "rule": "One-hot encode & frequency floor",
        "description": f"One-hot encode baskets into boolean matrix; pre-filter items below support floor {MIN_SUPPORT_FLOOR*100:.1f}% ({min_count_floor} baskets) to optimize memory",
        "rows_before": len(item_counts),
        "rows_after": len(eligible_items),
        "rows_removed": len(item_counts) - len(eligible_items),
        "metadata": {
            "min_count_floor": min_count_floor,
            "distinct_items_before": len(item_counts),
            "eligible_items_after": len(eligible_items)
        }
    })
    print(f"Step 11 [One-hot encode]: Filtered {len(item_counts)} items down to {len(eligible_items)} frequent items at {MIN_SUPPORT_FLOOR*100}% floor")

    # Construct efficient boolean matrix
    eligible_set = set(eligible_items)
    bool_data = []
    filtered_invoice_ids = []

    for _, row in multi_baskets_df.iterrows():
        basket_set = set(row["items"]) & eligible_set
        if basket_set:  # retain basket if it contains at least one candidate item
            row_bool = [it in basket_set for it in eligible_items]
            bool_data.append(row_bool)
            filtered_invoice_ids.append(row["InvoiceNo"])

    basket_matrix = pd.DataFrame(bool_data, index=filtered_invoice_ids, columns=eligible_items, dtype=bool)

    # Save Outputs
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    # Save baskets parquet and basket matrix
    multi_baskets_df.to_parquet(BASKETS_PARQUET_PATH, index=False)
    basket_matrix.to_parquet(BASKET_MATRIX_PARQUET_PATH)

    with open(LABEL_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(label_map, f, indent=2)

    with open(PREPROCESSING_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2)

    final_counts = {
        "final_invoice_count": int(len(filtered_invoice_ids)),
        "final_basket_count": int(len(multi_baskets_df)),
        "total_valid_uk_baskets": int(total_valid_baskets),
        "final_product_count": int(len(eligible_items)),
        "average_basket_size": float(multi_baskets_df["basket_size"].mean()),
        "median_basket_size": float(multi_baskets_df["basket_size"].median()),
        "matrix_shape": list(basket_matrix.shape),
        "support_denominator": "baskets_ge_2",
        "denominator_count": int(len(multi_baskets_df))
    }
    with open(FINAL_COUNTS_PATH, "w", encoding="utf-8") as f:
        json.dump(final_counts, f, indent=2)

    print("\n" + "=" * 60)
    print("PREPROCESSING COMPLETE:")
    print(f"  Valid UK Invoices (>=2 items): {final_counts['final_basket_count']}")
    print(f"  Products meeting support floor: {final_counts['final_product_count']}")
    print(f"  Average basket size: {final_counts['average_basket_size']:.2f}")
    print(f"  Boolean Matrix shape: {basket_matrix.shape}")
    print("=" * 60 + "\n")

    return multi_baskets_df, basket_matrix, label_map, log


if __name__ == "__main__":
    run_preprocessing_pipeline()
