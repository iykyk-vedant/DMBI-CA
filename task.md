# Task List & Execution Roadmap: Market Basket Analysis & Product Recommendation (CA2)

> **Document Purpose:** Master execution plan, task tracker, and status checklist for CA2 implementation based on [`ANTIGRAVITY_SPEC.md`](file:///d:/DMBI%20CA/ANTIGRAVITY_SPEC.md) and [`PRD .md`](file:///d:/DMBI%20CA/PRD%20.md).  
> **Case Study:** Market Basket Analysis and Product Recommendation Using Association Rule Mining (Retail / E-Commerce)  
> **Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B  
> **Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)  
> **Guide:** Sukanya Roychowdhury  

---

## Progress Overview

| Phase / Milestone | Description | Priority | Status |
|---|---|---|---|
| **Phase 1: Setup & Scaffolding** | Repository structure, environments, config, and dataset ingestion | P0 | [x] Completed |
| **Phase 2: Preprocessing Pipeline** | 11-step cleaning, UK scope, basket encoding, and validation | P0 | [x] Completed |
| **Phase 3: Exploratory Data Analysis (EDA)** | Core retail distributions, CA1 Viz #1, and dataset justification | P0/P1 | [x] Completed |
| **Phase 4: Association Rule Mining Engine** | FP-Growth & Apriori, rule generation, post-processing flags, caching | P0 | [x] Completed |
| **Phase 5: Benchmark & Sensitivity Analysis** | Algorithm comparison (CA1 Viz #4), sensitivity grid (0.5%, 1%, 2%) | P0 | [x] Completed |
| **Phase 6: Recommender & Offline Evaluation** | Single product & cart recommender, 80/20 time split, popularity baseline | P0 | [x] Completed |
| **Phase 7: Backend API (FastAPI)** | REST endpoints, Pydantic schemas, guardrails, and API tests (19 passed) | P0 | [x] Completed |
| **Phase 8: Frontend Application (React + Vite + TS)** | 11 dashboard pages, interactive controls, charts, network graph | P0/P1 | [x] Completed |
| **Phase 9: Analysis Artifacts & Exports** | Figure exports (PNG 200 dpi), CSV tables, Jupyter notebook | P0/P1 | [x] Completed |
| **Phase 10: Decision Support, Insights & Docs** | `DECISIONS.md`, `METHODOLOGY.md`, `INSIGHTS.md`, `README.md` | P0 | [x] Completed |
| **Phase 11: End-to-End Verification & Acceptance** | Acceptance checklist audit, reproducibility check, demo dry-run | P0 | [x] Completed |

---

## Detailed Task Breakdown

### Phase 1: Environment Setup & Project Scaffolding (Milestone M1)

- [x] **1.1 Directory Structure & Git Configuration**
  - [x] Initialized repository structure matching `ANTIGRAVITY_SPEC.md §3`:
    - `backend/` (`app/`, `scripts/`, `data/raw/`, `data/processed/`, `results/`, `results/figures/`, `results/cache/`, `tests/`)
    - `frontend/` (`src/`, `public/`, etc.)
    - `docs/` (`DECISIONS.md`, `METHODOLOGY.md`, `INSIGHTS.md`)
    - `notebooks/`
  - [x] Configured `.gitignore` to ignore raw/processed datasets (`backend/data/raw/*.xlsx`, `*.parquet`), Python virtual environments (`.venv/`, `__pycache__/`), and frontend build artifacts (`node_modules/`, `dist/`).
- [x] **1.2 Backend Dependency Configuration**
  - [x] Created `backend/requirements.txt` with pinned versions:
    - `fastapi`, `uvicorn[standard]`, `pydantic>=2.0`
    - `pandas`, `numpy`, `openpyxl`, `pyarrow`
    - `mlxtend>=0.22.0`
    - `matplotlib`, `pytest`, `httpx`
- [x] **1.3 Application Configuration & Paths**
  - [x] Created `backend/app/config.py`:
    - Defined file paths: raw dataset, processed parquets, cache directory, results directory, figures directory.
    - Defined default parameters: `DEFAULT_MIN_SUPPORT = 0.01`, `DEFAULT_MIN_CONFIDENCE = 0.50`, `DEFAULT_MIN_LIFT = 1.0`, `DEFAULT_MAX_LEN = 4`.
    - Defined guardrails: `MIN_SUPPORT_FLOOR = 0.005`, `LIVE_RUN_TIMEOUT_SECONDS = 120`.
- [x] **1.4 Dataset Placement & Ingestion Guard**
  - [x] Verified `backend/data/raw/Online Retail.xlsx` exists (downloaded 22.6 MB official dataset).
  - [x] Implemented automated dataset fetcher script `backend/scripts/download_dataset.py`.
  - [x] Implemented Excel-to-Parquet initial cache converter (`backend/data/processed/raw.parquet`) to eliminate repeated slow `.xlsx` reads.

---

### Phase 2: Data Preprocessing Pipeline (Milestone M2)

- [x] **2.1 Raw Data Profiler**
  - [x] Calculated raw profile metrics on `Online Retail.xlsx`:
    - Total record count: 541,909 rows, 8 columns.
    - Distinct invoice counts, distinct stock codes, identified customer IDs, countries.
    - Missing value counts across all columns (`Description`: 1,454, `CustomerID`: 135,080).
  - [x] Saved output as `backend/results/raw_profile.json` comparing recomputed figures against CA1 reference figures side by side.
- [x] **2.2 Preprocessing Engine Implementation (`backend/app/services/preprocessing.py`)**
  - [x] Implemented step-by-step pipeline tracking `{step, rule, rows_before, rows_after, rows_removed}`:
    - **Step 1:** Load and inspect raw data (541,909 rows).
    - **Step 2:** Missing keys filter (0 dropped; CustomerID retained for invoice baskets).
    - **Step 3:** Cancellation filter: dropped 9,288 return invoices starting with 'C'.
    - **Step 4:** Invalid values filter: dropped 2,517 rows with non-positive Quantity or UnitPrice.
    - **Step 5:** Non-product filter: dropped 2,379 rows (`POST`, `DOT`, `BANK CHARGES`, vouchers, non-regex).
    - **Step 6:** Exact duplicate filter: dropped 5,221 identical transaction duplicates.
    - **Step 7:** Text standardization: standardized descriptions and built canonical `StockCode -> label` mapping.
    - **Step 8:** Target scope filter: restricted to UK invoices (removed 43,666 non-UK records; retained 478,838 UK records).
    - **Step 9:** Basket grouping: grouped into 17,901 unique transaction baskets.
    - **Step 10:** Basket size filtering: dropped 1,395 single-item baskets, yielding 16,506 multi-item baskets.
    - **Step 11:** Basket encoding: filtered items below 0.5% support floor to optimize memory; generated sparse boolean matrix (16,429 baskets, 1,628 items).
- [x] **2.3 Persistence & Artifact Outputs**
  - [x] Saved `backend/data/processed/baskets.parquet`.
  - [x] Saved `backend/data/processed/label_map.json`.
  - [x] Saved `backend/results/preprocessing_log.json`.
  - [x] Saved `backend/results/final_counts.json` (final invoice count, product count, basket count, average basket size: 28.61 items).
- [x] **2.4 Preprocessing Unit Tests (`backend/tests/test_preprocessing.py`)**
  - [x] Tested cancellation identification (`InvoiceNo` starting with 'C').
  - [x] Tested removal of non-positive quantity and zero/negative unit price.
  - [x] Tested non-product stock code regex and exclusion list filtering.
  - [x] Tested UK scope isolation.
  - [x] All preprocessing tests passed.

---

### Phase 3: Exploratory Data Analysis (EDA) (Milestone M3)

- [x] **3.1 EDA Service Implementation (`backend/app/services/eda.py`)**
  - [x] Computed Top 10 products by invoice count in UK dataset (CA1 Viz #1) with human-readable labels.
  - [x] Computed monthly invoice counts across Dec 2010 – Dec 2011 (annotated Dec 2011 partial month).
  - [x] Computed basket size distribution (histogram bins, mean: 28.61, median: 15.0).
  - [x] Computed raw vs cleaned distribution metrics for `Quantity` and `UnitPrice`.
  - [x] Computed country market share breakdown from raw data (empirically justifying the UK focus > 90%).
- [x] **3.2 EDA Precomputations & JSON Exports**
  - [x] Saved `backend/results/eda_summary.json` containing precomputed chart data for instant UI rendering.

---

### Phase 4: Association Rule Mining Engine (Milestone M4)

- [x] **4.1 Core Mining Service (`backend/app/services/mining.py`)**
  - [x] Implemented `run_fpgrowth(basket_matrix, min_support, max_len)` using `mlxtend.frequent_patterns.fpgrowth`.
  - [x] Implemented `run_apriori(basket_matrix, min_support, max_len)` using `mlxtend.frequent_patterns.apriori`.
  - [x] Implemented `generate_rules(itemsets_df, min_confidence, min_lift)` using `mlxtend.frequent_patterns.association_rules`.
  - [x] Computed association metrics: Support, Confidence, Lift, Leverage, Conviction.
  - [x] Formatted antecedents and consequents into structured objects: `[{ "code": str, "label": str }]`.
- [x] **4.2 Rule Post-Processing & Actionability Heuristics**
  - [x] Flagged **Redundant Rules**: detected superset antecedents that offer no confidence improvement.
  - [x] Flagged **Popularity-Driven Rules**: detected high confidence paired with near-neutral lift or high base support.
  - [x] Flagged **Variant-Product Rules**: identified item pairs sharing base product descriptions; tagged `rule_type: "variant"` vs `"complementary"`.
  - [x] Assigned boolean flag `actionable: bool` and explanatory string `reason`.
- [x] **4.3 Correctness Unit Test: CA1 Worked Mini-Example (`backend/tests/test_mini_example.py`)**
  - [x] Constructed the 5-transaction hypothetical dataset from CA1 §7.2.
  - [x] Verified frequent 1-itemsets: A (4), B (3), C (4); D and E pruned.
  - [x] Verified frequent 2-itemsets: {A,B} (2), {A,C} (3), {B,C} (3).
  - [x] Verified frequent 3-itemset: {A,B,C} (2).
  - [x] Verified Rule $A \rightarrow C$: Support = 60%, Confidence = 75%, Lift = 0.9375 (~0.94).
  - [x] Verified Rule $B \rightarrow C$: Support = 60%, Confidence = 100%, Lift = 1.25.
  - [x] Asserted FP-Growth and Apriori produce identical itemsets and supports.
- [x] **4.4 Mining Cache Service (`backend/app/services/cache.py`)**
  - [x] Implemented hashing key `(algorithm, min_support, min_confidence, min_lift, max_len, scope_hash)`.
  - [x] Precomputed default run (FP-Growth, 1% support, 50% conf, lift > 1) -> 2,830 itemsets, 1,865 rules saved to `rules_default.json`.

---

### Phase 5: Benchmark & Sensitivity Analysis (Milestone M5)

- [x] **5.1 Algorithm Comparison Engine (`backend/app/services/benchmark.py`)**
  - [x] Executed comparative runs of Apriori vs FP-Growth on identical UK basket matrices for supports: 2.0%, 1.0%, 0.5%.
  - [x] Timed execution with `time.perf_counter()` and recorded memory with `tracemalloc`.
  - [x] Enforced automated equality assertion: verified `set(itemsets_fpgrowth) == set(itemsets_apriori)`.
  - [x] Handled timeout honestly: Apriori logged "Timed out after 60s" at 0.5% support.
  - [x] Output `backend/results/benchmark_results.json`.
- [x] **5.2 Sensitivity Analysis Engine**
  - [x] Executed parameter sensitivity sweep: `min_support` $\in \{0.5\%, 1.0\%, 2.0\%\}$ with `min_confidence = 0.50`, `min_lift = 1.0`.
  - [x] For each threshold, recorded: itemset count, rule count, max lift, median lift, runtime.
  - [x] Generated natural-language sensitivity summary describing exact scaling behavior.
  - [x] Output `backend/results/sensitivity_results.json`.

---

### Phase 6: Recommender & Offline Evaluation (Milestone M5)

- [x] **6.1 Recommendation Engine (`backend/app/services/recommender.py`)**
  - [x] Built fast lookup index: `antecedent_tuple -> list_of_consequents_with_metrics`.
  - [x] **Single Product Mode:** Given product $P$, find rules where $P \in \text{antecedent}$, sort consequents by lift, exclude $P$, return top-$k$ with explanation.
  - [x] **Cart Simulator Mode:** Given cart basket $C$, identify active rules where $\text{antecedent} \subseteq C$, filter out cart items, return top-$k$ with explanation.
  - [x] **Fallback Strategy:** If no rules match, return clear empty state with explanation; provide labeled popular fallback.
- [x] **6.2 Offline Evaluation Engine (Time-Based Split)**
  - [x] Chronologically split dataset: 80% train invoices (13,204), 20% test invoices (3,302).
  - [x] Re-mined association rules on train set only (1,889 rules found).
  - [x] Evaluated test baskets with size $\ge 2$ using Leave-One-Out validation:
    - **Hit Rate@1:** Rule Recommender = 4.63% vs Popularity Baseline = 0.55% (+4.08%)
    - **Hit Rate@3:** Rule Recommender = 7.15% vs Popularity Baseline = 1.30% (+5.85%)
    - **Hit Rate@5:** Rule Recommender = 8.03% vs Popularity Baseline = 1.91% (+6.12%)
    - **Catalog Coverage:** 65.48% (2,162 covered test baskets).
  - [x] Saved output as `backend/results/recommender_eval.json`.
- [x] **6.3 Rule-to-Decision Matrix Population**
  - [x] Populated CA1 §9.8 decision matrix with actual mined rules across 4 operational categories.
  - [x] Saved output as `backend/results/decision_matrix.json`.

---

### Phase 7: Backend API Development & Testing (Milestone M6)

- [x] **7.1 Pydantic Schemas (`backend/app/schemas.py`)**
  - [x] Defined request and response schemas for all 15 endpoints.
- [x] **7.2 API Endpoints (`backend/app/routers/`)**
  - [x] Implemented `/api/health`, `/api/data/*`, `/api/eda/*`, `/api/mining/*`, `/api/compare/*`, `/api/sensitivity`, `/api/recommend/*`, `/api/insights/*`.
- [x] **7.3 API Concurrency & Guardrails**
  - [x] Restricted minimum support floor $\ge 0.005$ with HTTP 422.
  - [x] Concurrency lock to prevent overlapping live CPU-heavy mining runs.
  - [x] Enabled CORS for Vite frontend origin (`http://localhost:5173`).
- [x] **7.4 API Automated Tests (`backend/tests/test_api.py`)**
  - [x] Wrote 10 tests with `TestClient` verifying responses, status codes, and input validation.
  - [x] All 19 tests in repository passing.

---

### Phase 8: Frontend Application Development (Milestone M6)

- [x] **8.1 Frontend Setup & Architecture**
  - [x] Scaffolded Vite React application with TypeScript and Tailwind CSS v4 in `frontend/`.
  - [x] Configured `@tanstack/react-query`, `react-router-dom`, `recharts`, and `lucide-react`.
  - [x] Defined TypeScript interfaces matching backend Pydantic schemas.
  - [x] Created reusable UI components: `Navbar`, `StatCard`, `ProcessFlow`, `RuleTable`.
- [x] **8.2 Page 1: Overview & Executive Dashboard (`DashboardPage.tsx`)**
- [x] **8.3 Page 2: Data & Preprocessing (`PreprocessingPage.tsx`)**
- [x] **8.4 Page 3: Exploratory Data Analysis (`EdaPage.tsx`)**
- [x] **8.5 Page 4: Interactive Mining Explorer (`ExplorerPage.tsx`)**
- [x] **8.6 Page 5: Advanced Visualizations (`VisualisationsPage.tsx`)**
- [x] **8.7 Page 6: Algorithm Comparison (`ComparisonPage.tsx`)**
- [x] **8.8 Page 7: Parameter Sensitivity Analysis (`SensitivityPage.tsx`)**
- [x] **8.9 Page 8: Product Recommender & Cart Simulator (`RecommenderPage.tsx`)**
- [x] **8.10 Page 9: Evaluation & Business Impact (`EvaluationPage.tsx`)**
- [x] **8.11 Page 10: Actionable Business Insights (`InsightsPage.tsx`)**
- [x] **8.12 Page 11: Methodology & Academic Alignment (`MethodologyPage.tsx`)**
- [x] **8.13 App Shell & Routing (`App.tsx`)**

---

### Phase 9: Analysis Artifacts, Figures & Notebook (Milestone M7)

- [x] **9.1 Report Figure Generation Script (`backend/scripts/export_figures.py`)**
  - [x] Exported publication-quality 200 DPI PNG figures into `backend/results/figures/`:
    - `top10_products.png`, `monthly_invoices.png`, `basket_size_hist.png`
    - `preprocessing_waterfall.png`, `top_rules_by_lift.png`, `support_vs_confidence_lift.png`
- [x] **9.2 CSV Data Exports**
  - [x] Exported `preprocessing_log.csv`, `rules_default.csv`, `top20_rules.csv`.
- [x] **9.3 Reproducible Jupyter Notebook (`notebooks/ca2_analysis.ipynb`)**
  - [x] Generated standalone notebook executing the entire pipeline step by step.

---

### Phase 10: Decision Support, Insights & Documentation (Milestone M7)

- [x] **10.1 Architectural Decisions Log (`docs/DECISIONS.md`)**
  - [x] Documented all 6 design choices, heuristics, and justifications.
- [x] **10.2 Academic Methodology Document (`docs/METHODOLOGY.md`)**
  - [x] Documented complete workflow structured to match CA1 sections 1 to 13.
- [x] **10.3 Real Business Insights Document (`docs/INSIGHTS.md`)**
  - [x] Created `backend/scripts/generate_insights.py` and generated insights covering sections 1–10.
- [x] **10.4 Project Master README (`README.md`)**
  - [x] Documented setup, architecture, run instructions, and CA2 traceability matrix.

---

### Phase 11: End-to-End Verification & Acceptance Checklist

- [x] **Pipeline Execution:** Single script `python backend/scripts/run_pipeline.py` executes end-to-end without errors.
- [x] **Preprocessing Verification:** Preprocessing log matches actual removals; final counts verified (16,506 baskets, 1,628 items).
- [x] **Scope Verification:** UK-only filtering applied prior to basket generation.
- [x] **Algorithm Dual Implementation:** Both FP-Growth and Apriori executed; identical itemsets verified.
- [x] **Parameter Conformance:** Default min support = 1%, min confidence = 50%, min lift > 1.
- [x] **Sensitivity Analysis:** 0.5%, 1%, 2% support levels computed and compared.
- [x] **Visualizations:** All 4 required CA1 visualizations implemented and populated with real data.
- [x] **Recommender Functionality:** Single product and multi-item cart recommendations work with clear explanations.
- [x] **Offline Evaluation:** 80/20 time split completed; hit rates reported honestly against baseline (+4.2x over popularity).
- [x] **Decision Matrix:** Mined rules mapped to practical business actions.
- [x] **Integrity Guarantee:** Zero hard-coded or fabricated numbers; strict adherence to correlation vs causation language.
- [x] **Mini-Example Sanity Check:** CA1 worked example unit test passes ($A \rightarrow C$ lift ~0.94, $B \rightarrow C$ lift 1.25).
- [x] **Report Artifacts:** Figures (200 dpi PNGs), CSV tables, and notebook fully generated.
