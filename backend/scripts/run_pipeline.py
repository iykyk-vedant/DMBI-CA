"""Master Offline Pipeline Script for CA2.
Executes the full pipeline sequentially:
1. Dataset verification & caching
2. 11-step Preprocessing pipeline
3. Exploratory Data Analysis (EDA) summary
4. Default FP-Growth Association Rule Mining
5. Algorithm Comparison Benchmark (Apriori vs FP-Growth)
6. Parameter Sensitivity Analysis (0.5%, 1%, 2%)
7. Recommender Offline Evaluation (80/20 train/test split)
8. CA1 Section 9.8 Rule-to-Decision Matrix Population
"""

import sys
import time
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.preprocessing import run_preprocessing_pipeline
from app.services.eda import run_eda_analysis
from app.services.mining import precompute_default_results
from app.services.benchmark import run_comparative_benchmark, run_sensitivity_analysis
from app.services.recommender import run_offline_evaluation, build_rule_decision_matrix


def run_full_pipeline():
    start_time = time.perf_counter()
    print("=" * 70)
    print("STARTING CA2 END-TO-END DATA MINING PIPELINE")
    print("=" * 70)

    # 1. Preprocessing
    print("\n>>> STAGE 1: DATA PREPROCESSING (11 STEPS)")
    baskets_df, matrix, label_map, log = run_preprocessing_pipeline()

    # 2. EDA
    print("\n>>> STAGE 2: EXPLORATORY DATA ANALYSIS")
    eda_summary = run_eda_analysis()

    # 3. Default Mining Run
    print("\n>>> STAGE 3: DEFAULT MINING RUN (FP-GROWTH, 1% SUPPORT)")
    default_rules = precompute_default_results()

    # 4. Sensitivity Analysis
    print("\n>>> STAGE 4: PARAMETER SENSITIVITY ANALYSIS (0.5%, 1%, 2%)")
    sensitivity_data = run_sensitivity_analysis()

    # 5. Algorithm Comparison Benchmark
    print("\n>>> STAGE 5: ALGORITHM COMPARISON BENCHMARK (FP-GROWTH VS APRIORI)")
    benchmark_data = run_comparative_benchmark()

    # 6. Recommender Evaluation
    print("\n>>> STAGE 6: RECOMMENDER OFFLINE EVALUATION (80/20 TIME SPLIT)")
    eval_results = run_offline_evaluation()

    # 7. Rule-to-Decision Matrix
    print("\n>>> STAGE 7: RULE-TO-DECISION MATRIX POPULATION")
    decision_matrix = build_rule_decision_matrix()

    elapsed = time.perf_counter() - start_time
    print("\n" + "=" * 70)
    print(f"PIPELINE COMPLETE in {elapsed:.2f} seconds ({elapsed/60:.2f} minutes)!")
    print("All outputs, metrics, and cache files successfully generated.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_full_pipeline()

