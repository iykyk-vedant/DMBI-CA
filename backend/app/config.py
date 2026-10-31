"""Central configuration module for CA2 Market Basket Analysis application.
Defines filesystem paths, algorithm default hyperparameters, safety guardrails,
and CA1 reference baseline figures.
"""

from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RESULTS_DIR = BACKEND_DIR / "results"
FIGURES_DIR = RESULTS_DIR / "figures"
CACHE_DIR = RESULTS_DIR / "cache"
DOCS_DIR = WORKSPACE_DIR / "docs"

# Data Files
RAW_DATASET_NAME = "Online Retail.xlsx"
RAW_DATASET_PATH = RAW_DATA_DIR / RAW_DATASET_NAME
RAW_PARQUET_PATH = PROCESSED_DATA_DIR / "raw.parquet"
BASKETS_PARQUET_PATH = PROCESSED_DATA_DIR / "baskets.parquet"
LABEL_MAP_PATH = PROCESSED_DATA_DIR / "label_map.json"

# Result Files
RAW_PROFILE_PATH = RESULTS_DIR / "raw_profile.json"
PREPROCESSING_LOG_PATH = RESULTS_DIR / "preprocessing_log.json"
FINAL_COUNTS_PATH = RESULTS_DIR / "final_counts.json"
EDA_SUMMARY_PATH = RESULTS_DIR / "eda_summary.json"
BENCHMARK_RESULTS_PATH = RESULTS_DIR / "benchmark_results.json"
SENSITIVITY_RESULTS_PATH = RESULTS_DIR / "sensitivity_results.json"
RECOMMENDER_EVAL_PATH = RESULTS_DIR / "recommender_eval.json"
DECISION_MATRIX_PATH = RESULTS_DIR / "decision_matrix.json"

# Mining Defaults (Pre-registered in CA1)
DEFAULT_ALGORITHM = "fpgrowth"
DEFAULT_MIN_SUPPORT = 0.01          # 1%
DEFAULT_MIN_CONFIDENCE = 0.50       # 50%
DEFAULT_MIN_LIFT = 1.0              # > 1.0
DEFAULT_MAX_LEN = 4                 # max itemset length
SUPPORT_DENOMINATOR = "baskets_ge_2" # 'baskets_ge_2' (default) or 'all_valid'

# Guardrails for Live Runs
MIN_SUPPORT_FLOOR = 0.005           # 0.5%
LIVE_RUN_TIMEOUT_SECONDS = 120      # 2 minutes max for interactive runs

# Evaluation & Sensitivity Grids
SENSITIVITY_SUPPORTS = [0.005, 0.01, 0.02]
BENCHMARK_SUPPORTS = [0.02, 0.01, 0.005]
EVALUATION_K_VALUES = [1, 3, 5]
RANDOM_SEEDS = [42, 123, 999]

# CA1 Reference Profile (For comparison table against computed profile)
CA1_RAW_PROFILE_REFERENCE = {
    "total_records": 541909,
    "distinct_invoices": 25900,
    "distinct_products": 4070,
    "distinct_customers": 4372,
    "countries_represented": 38,
    "missing_descriptions": 1454,
    "missing_customer_ids": 135080,
    "source_note": "Reported in CA1 Table 3.5 from published exploratory profile of UCI dataset"
}
