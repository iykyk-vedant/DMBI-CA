"""Notebook generator script for CA2 analysis.
Creates a complete, executable Jupyter notebook that walks through the entire pipeline.
"""

import json
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent.parent
NOTEBOOK_PATH = WORKSPACE_DIR / "notebooks" / "ca2_analysis.ipynb"


def create_notebook():
    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Continuous Assessment - 2 (CA2): Market Basket Analysis & Product Recommendation\n",
                "\n",
                "**Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B  \n",
                "**Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)  \n",
                "**Guide:** Sukanya Roychowdhury  \n",
                "**Dataset:** UCI Machine Learning Repository – Online Retail (Dataset ID 352)  \n",
                "\n",
                "---\n",
                "\n",
                "## 1. Problem Statement & Research Goal\n",
                "> *How can historical retail transactions be analysed to discover which products are frequently purchased together, so that the retailer can generate data-driven product recommendations and cross-selling strategies?*\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 1,
            "metadata": {},
            "outputs": [],
            "source": [
                "import sys\n",
                "from pathlib import Path\n",
                "\n",
                "# Setup sys.path for backend service imports\n",
                "BACKEND_DIR = Path.cwd() / 'backend' if (Path.cwd() / 'backend').exists() else Path.cwd().parent / 'backend'\n",
                "if str(BACKEND_DIR) not in sys.path:\n",
                "    sys.path.insert(0, str(BACKEND_DIR))\n",
                "\n",
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import json\n",
                "\n",
                "from app.services.preprocessing import load_raw_dataframe, generate_raw_profile, run_preprocessing_pipeline\n",
                "from app.services.eda import run_eda_analysis\n",
                "from app.services.mining import execute_mining_run\n",
                "from app.services.recommender import get_default_recommender, run_offline_evaluation, build_rule_decision_matrix\n",
                "print('Environment and services successfully imported.')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 2. Raw Data Inspection & Profile Verification\n",
                "Loading raw dataset records and computing the empirical dataset profile directly from the file."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 2,
            "metadata": {},
            "outputs": [],
            "source": [
                "raw_df = load_raw_dataframe()\n",
                "print('Raw Dataset Dimensions:', raw_df.shape)\n",
                "raw_profile = generate_raw_profile(raw_df)\n",
                "print('Total Records:', raw_profile['computed']['total_records'])\n",
                "print('Distinct Invoices:', raw_profile['computed']['distinct_invoices'])\n",
                "print('Distinct Products:', raw_profile['computed']['distinct_products'])\n",
                "print('Distinct Customers:', raw_profile['computed']['distinct_customers'])"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. 11-Step Data Preprocessing Pipeline\n",
                "Executing the reproducible cleaning pipeline with row removal logging."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 3,
            "metadata": {},
            "outputs": [],
            "source": [
                "baskets_df, matrix, label_map, log = run_preprocessing_pipeline()\n",
                "log_df = pd.DataFrame(log)\n",
                "print(log_df[['step', 'rule', 'rows_before', 'rows_after', 'rows_removed']])"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Exploratory Data Analysis (EDA)\n",
                "Computing retail sales patterns, seasonality, and CA1 Visualisation #1."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 4,
            "metadata": {},
            "outputs": [],
            "source": [
                "eda_summary = run_eda_analysis()\n",
                "top_products = pd.DataFrame(eda_summary['top_products'])\n",
                "print('Top 10 Products by Valid UK Invoices:')\n",
                "print(top_products[['rank', 'stock_code', 'label', 'invoice_count', 'share_of_baskets_pct']])"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Association Rule Mining (FP-Growth)\n",
                "Mining frequent itemsets and generating association rules evaluated by Support, Confidence, and Lift."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 5,
            "metadata": {},
            "outputs": [],
            "source": [
                "result = execute_mining_run(algorithm='fpgrowth', min_support=0.01, min_confidence=0.50, min_lift=1.0)\n",
                "print(f'Mined {result[\"n_itemsets\"]} frequent itemsets and {result[\"n_rules\"]} rules in {result[\"runtime_seconds\"]:.2f}s.')\n",
                "\n",
                "# Display Top 5 Rules by Lift\n",
                "for rank, r in enumerate(result['rules'][:5], 1):\n",
                "    ant = ' + '.join([a['label'] for a in r['antecedents']])\n",
                "    con = ' + '.join([c['label'] for c in r['consequents']])\n",
                "    print(f'{rank}. [{ant}] -> [{con}] | Lift: {r[\"lift\"]:.2f}x | Conf: {r[\"confidence\"]*100:.1f}% | Supp: {r[\"support\"]*100:.2f}%')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 6. Product Recommender & Cart Simulator\n",
                "Testing real-time single-item and multi-item basket recommendations with explanations."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 6,
            "metadata": {},
            "outputs": [],
            "source": [
                "recommender = get_default_recommender()\n",
                "single_rec = recommender.recommend_for_product('85099B', k=3)\n",
                "print('Single Product Recommendation for:', single_rec['query_product'])\n",
                "for rec in single_rec['recommendations']:\n",
                "    print(f' - [{rec[\"code\"]}] {rec[\"label\"]} (Lift: {rec[\"lift\"]:.1f}x, Conf: {rec[\"confidence\"]*100:.0f}%)')\n",
                "\n",
                "cart_rec = recommender.recommend_for_cart(['85099B', '22386'], k=3)\n",
                "print('\\nCart Recommendations for Multi-Item Basket:')\n",
                "for rec in cart_rec['recommendations']:\n",
                "    print(f' - [{rec[\"code\"]}] {rec[\"label\"]} | {rec[\"explanation\"]}')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 7. Offline Evaluation & Rule-to-Decision Matrix\n",
                "Evaluating generalisability on unseen future transactions (80/20 train/test split) and mapping rules to commercial decisions."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 7,
            "metadata": {},
            "outputs": [],
            "source": [
                "eval_data = run_offline_evaluation()\n",
                "eval_df = pd.DataFrame(eval_data['metrics'])\n",
                "print('Offline Evaluation Results (Rule Recommender vs Popularity Baseline):')\n",
                "print(eval_df)\n",
                "\n",
                "decision_matrix = build_rule_decision_matrix()\n",
                "print('\\nRule-to-Decision Matrix Sample:')\n",
                "for row in decision_matrix:\n",
                "    print(f'[{row[\"category\"]}] {row[\"possible_decision\"]} (Based on: {row[\"mining_insight\"][:40]}...)')"
            ]
        }
    ]

    notebook_content = {
        "cells": cells,
        "metadata": {
            "language_info": {"name": "python", "version": "3.10.11"}
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }

    NOTEBOOK_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(notebook_content, f, indent=2)

    print(f"Jupyter Notebook successfully created at: {NOTEBOOK_PATH}")


if __name__ == "__main__":
    create_notebook()
