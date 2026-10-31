"""Export script for publication-quality report figures (PNG 200 DPI) and CSV tables.
Generates all visualizations specified in CA1 and ANTIGRAVITY_SPEC.md Section 13.
"""

import sys
import json
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # headless backend
import matplotlib.pyplot as plt

from app.config import (
    FIGURES_DIR,
    RESULTS_DIR,
    EDA_SUMMARY_PATH,
    PREPROCESSING_LOG_PATH,
    BENCHMARK_RESULTS_PATH,
    SENSITIVITY_RESULTS_PATH,
    RECOMMENDER_EVAL_PATH
)

# Styling defaults
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.size"] = 10
plt.rcParams["axes.titlesize"] = 12
plt.rcParams["axes.labelsize"] = 11
plt.rcParams["figure.dpi"] = 200
FIGURE_DPI = 200


def export_eda_figures():
    """Generates EDA distribution and trend figures."""
    if not EDA_SUMMARY_PATH.exists():
        print("EDA summary missing. Skipping EDA figures.")
        return

    with open(EDA_SUMMARY_PATH, "r", encoding="utf-8") as f:
        eda = json.load(f)

    # 1. Top 10 Products Bar Chart (CA1 Viz #1)
    top_prods = eda.get("top_products", [])
    if top_prods:
        fig, ax = plt.subplots(figsize=(10, 6))
        # Shorten labels for display
        labels = [p["label"][:28] + ("..." if len(p["label"]) > 28 else "") for p in reversed(top_prods)]
        counts = [p["invoice_count"] for p in reversed(top_prods)]
        
        bars = ax.barh(labels, counts, color="#3b82f6", edgecolor="#1d4ed8")
        ax.set_xlabel("Number of Valid UK Invoices")
        ax.set_title("CA1 Viz #1: Top 10 Best-Selling Products by Invoice Count (UK)")
        ax.grid(axis="x", linestyle="--", alpha=0.5)
        
        for bar in bars:
            width = bar.get_width()
            ax.text(width + 20, bar.get_y() + bar.get_height() / 2, f"{int(width):,}", va="center", fontsize=9)
            
        fig.tight_layout()
        fig.savefig(FIGURES_DIR / "top10_products.png", dpi=FIGURE_DPI)
        plt.close(fig)
        print("Saved top10_products.png")

    # 2. Monthly Invoices Trend
    monthly = eda.get("monthly_trend", [])
    if monthly:
        fig, ax = plt.subplots(figsize=(10, 5))
        months = [m["month"] for m in monthly]
        counts = [m["invoice_count"] for m in monthly]
        colors = ["#93c5fd" if m["is_partial"] else "#2563eb" for m in monthly]

        bars = ax.bar(months, counts, color=colors, edgecolor="#1e40af")
        ax.set_ylabel("Valid Invoices")
        ax.set_title("Monthly Transaction Volume (Dec 2010 – Dec 2011)")
        ax.set_xticklabels(months, rotation=45, ha="right")
        ax.grid(axis="y", linestyle="--", alpha=0.5)

        # Annotate partial month
        if monthly[-1]["is_partial"]:
            ax.text(len(months) - 1, counts[-1] + 40, "Partial\n(ends Dec 9)", ha="center", fontsize=8, color="#b91c1c")

        fig.tight_layout()
        fig.savefig(FIGURES_DIR / "monthly_invoices.png", dpi=FIGURE_DPI)
        plt.close(fig)
        print("Saved monthly_invoices.png")

    # 3. Basket Size Histogram
    bs = eda.get("basket_sizes", {})
    hist = bs.get("histogram", [])
    if hist:
        fig, ax = plt.subplots(figsize=(8, 5))
        bins = [h["bin"] for h in hist]
        counts = [h["count"] for h in hist]

        ax.bar(bins, counts, color="#6366f1", edgecolor="#4338ca")
        ax.set_xlabel("Basket Size (Number of Unique Items)")
        ax.set_ylabel("Number of Baskets")
        ax.set_title(f"Basket Size Distribution (Mean: {bs['stats']['mean']}, Median: {bs['stats']['median']})")
        ax.grid(axis="y", linestyle="--", alpha=0.5)

        fig.tight_layout()
        fig.savefig(FIGURES_DIR / "basket_size_hist.png", dpi=FIGURE_DPI)
        plt.close(fig)
        print("Saved basket_size_hist.png")


def export_preprocessing_waterfall():
    """Generates Preprocessing Attrition Waterfall chart."""
    if not PREPROCESSING_LOG_PATH.exists():
        return

    with open(PREPROCESSING_LOG_PATH, "r", encoding="utf-8") as f:
        log = json.load(f)

    fig, ax = plt.subplots(figsize=(11, 6))
    steps = [f"Step {s['step']}: {s['rule'][:20]}" for s in log]
    rows = [s["rows_after"] for s in log]

    bars = ax.barh(steps[::-1], rows[::-1], color="#10b981", edgecolor="#047857")
    ax.set_xlabel("Surviving Records / Baskets")
    ax.set_title("Data Cleaning & Transformation Pipeline Waterfall")
    ax.grid(axis="x", linestyle="--", alpha=0.5)

    for bar in bars:
        width = bar.get_width()
        ax.text(width + 3000, bar.get_y() + bar.get_height() / 2, f"{int(width):,}", va="center", fontsize=8)

    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "preprocessing_waterfall.png", dpi=FIGURE_DPI)
    plt.close(fig)
    print("Saved preprocessing_waterfall.png")


def export_mining_figures():
    """Generates CA1 Viz #2 (Top Rules by Lift) and Viz #3 (Support vs Confidence Scatter)."""
    rules_path = RESULTS_DIR / "rules_default.json"
    if not rules_path.exists():
        return

    with open(rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rules = data.get("rules", [])
    if not rules:
        return

    df_rules = pd.DataFrame(rules)

    # CA1 Viz #2: Top Rules Ranked by Lift
    top_rules = rules[:15]
    fig, ax = plt.subplots(figsize=(12, 7))
    rule_labels = []
    for r in top_rules:
        a_lbl = r["antecedents"][0]["label"][:16]
        c_lbl = r["consequents"][0]["label"][:16]
        rule_labels.append(f"{a_lbl} -> {c_lbl}")

    lifts = [r["lift"] for r in top_rules]
    bars = ax.barh(rule_labels[::-1], lifts[::-1], color="#f59e0b", edgecolor="#d97706")
    ax.set_xlabel("Lift Value")
    ax.set_title("CA1 Viz #2: Top 15 Association Rules Ranked by Lift")
    ax.grid(axis="x", linestyle="--", alpha=0.5)

    for bar in bars:
        w = bar.get_width()
        ax.text(w + 0.5, bar.get_y() + bar.get_height() / 2, f"{w:.2f}", va="center", fontsize=9)

    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "top_rules_by_lift.png", dpi=FIGURE_DPI)
    plt.close(fig)
    print("Saved top_rules_by_lift.png")

    # CA1 Viz #3: Support vs Confidence Scatter Plot (Lift as Color)
    fig, ax = plt.subplots(figsize=(9, 6))
    supp = df_rules["support"] * 100
    conf = df_rules["confidence"] * 100
    lift = df_rules["lift"]

    sc = ax.scatter(supp, conf, c=lift, cmap="viridis", alpha=0.7, s=40, edgecolors="none")
    cbar = fig.colorbar(sc, ax=ax)
    cbar.set_label("Lift")

    ax.set_xlabel("Support (%)")
    ax.set_ylabel("Confidence (%)")
    ax.set_title("CA1 Viz #3: Association Rules Support vs Confidence (Color = Lift)")
    ax.grid(True, linestyle="--", alpha=0.5)

    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "support_vs_confidence_lift.png", dpi=FIGURE_DPI)
    plt.close(fig)
    print("Saved support_vs_confidence_lift.png")


def export_csv_tables():
    """Exports key result tables to CSV for easy inclusion into reports."""
    # Preprocessing log CSV
    if PREPROCESSING_LOG_PATH.exists():
        with open(PREPROCESSING_LOG_PATH, "r", encoding="utf-8") as f:
            log = json.load(f)
        pd.DataFrame(log).to_csv(RESULTS_DIR / "preprocessing_log.csv", index=False)
        print("Exported preprocessing_log.csv")

    # Rules CSV
    rules_path = RESULTS_DIR / "rules_default.json"
    if rules_path.exists():
        with open(rules_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        rules = data.get("rules", [])
        if rules:
            flattened = []
            for r in rules:
                flattened.append({
                    "id": r["id"],
                    "antecedents": " + ".join([a["label"] for a in r["antecedents"]]),
                    "consequents": " + ".join([c["label"] for c in r["consequents"]]),
                    "support": r["support"],
                    "confidence": r["confidence"],
                    "lift": r["lift"],
                    "leverage": r["leverage"],
                    "conviction": r["conviction"],
                    "rule_type": r["rule_type"],
                    "actionable": r["actionable"],
                    "reason": r["reason"]
                })
            df = pd.DataFrame(flattened)
            df.to_csv(RESULTS_DIR / "rules_default.csv", index=False)
            df.head(20).to_csv(RESULTS_DIR / "top20_rules.csv", index=False)
            print("Exported rules_default.csv and top20_rules.csv")


def run_all_exports():
    """Generates all figures and CSV outputs."""
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    export_eda_figures()
    export_preprocessing_waterfall()
    export_mining_figures()
    export_csv_tables()
    print("All report exports successfully written to", FIGURES_DIR)


if __name__ == "__main__":
    run_all_exports()

