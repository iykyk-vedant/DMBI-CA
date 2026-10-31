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
| **Phase 1: Setup & Scaffolding** | Repository structure, environments, config, and dataset ingestion | P0 | [ ] Pending |
| **Phase 2: Preprocessing Pipeline** | 11-step cleaning, UK scope, basket encoding, and validation | P0 | [ ] Pending |
| **Phase 3: Exploratory Data Analysis (EDA)** | Core retail distributions, CA1 Viz #1, and dataset justification | P0/P1 | [ ] Pending |
| **Phase 4: Association Rule Mining Engine** | FP-Growth & Apriori, rule generation, post-processing flags, caching | P0 | [ ] Pending |
| **Phase 5: Benchmark & Sensitivity Analysis** | Algorithm comparison (CA1 Viz #4), sensitivity grid (0.5%, 1%, 2%) | P0 | [ ] Pending |
| **Phase 6: Recommender & Offline Evaluation** | Single product & cart recommender, 80/20 time split, popularity baseline | P0 | [ ] Pending |
| **Phase 7: Backend API (FastAPI)** | REST endpoints, Pydantic schemas, guardrails, and API tests | P0 | [ ] Pending |
| **Phase 8: Frontend Application (React + Vite + TS)** | 11 dashboard pages, interactive controls, charts, network graph | P0/P1 | [ ] Pending |
| **Phase 9: Analysis Artifacts & Exports** | Figure exports (PNG 200 dpi), CSV tables, Jupyter notebook | P0/P1 | [ ] Pending |
| **Phase 10: Decision Support, Insights & Docs** | `DECISIONS.md`, `METHODOLOGY.md`, `INSIGHTS.md`, `README.md` | P0 | [ ] Pending |
| **Phase 11: End-to-End Verification & Acceptance** | Acceptance checklist audit, reproducibility check, demo dry-run | P0 | [ ] Pending |

---

## Detailed Task Breakdown

### Phase 1: Environment Setup & Project Scaffolding (Milestone M1)

- [ ] **1.1 Directory Structure & Git Configuration**
  - [ ] Initialize repository structure matching `ANTIGRAVITY_SPEC.md §3`:
    - `backend/` (`app/`, `scripts/`, `data/raw/`, `data/processed/`, `results/`, `results/figures/`, `results/cache/`, `tests/`)
    - `frontend/` (`src/`, `public/`, etc.)
    - `docs/` (`DECISIONS.md`, `METHODOLOGY.md`, `INSIGHTS.md`)
    - `notebooks/`
  - [ ] Create `.gitignore` to ignore raw/processed datasets (`backend/data/raw/*.xlsx`, `*.parquet`), Python virtual environments (`.venv/`, `__pycache__/`), and frontend build artifacts (`node_modules/`, `dist/`).
- [ ] **1.2 Backend Dependency Configuration**
  - [ ] Create `backend/requirements.txt` with pinned versions:
    - `fastapi`, `uvicorn[standard]`, `pydantic>=2.0`
    - `pandas`, `numpy`, `openpyxl`, `pyarrow`
    - `mlxtend>=0.22.0`
    - `matplotlib`, `pytest`, `httpx`
- [ ] **1.3 Application Configuration & Paths**
  - [ ] Create `backend/app/config.py`:
    - Define file paths: raw dataset, processed parquets, cache directory, results directory, figures directory.
    - Define default parameters: `DEFAULT_MIN_SUPPORT = 0.01`, `DEFAULT_MIN_CONFIDENCE = 0.50`, `DEFAULT_MIN_LIFT = 1.0`, `DEFAULT_MAX_LEN = 4`.
    - Define guardrails: `MIN_SUPPORT_FLOOR = 0.005`, `LIVE_RUN_TIMEOUT_SECONDS = 120`.
- [ ] **1.4 Dataset Placement & Ingestion Guard**
  - [ ] Verify `backend/data/raw/Online Retail.xlsx` exists.
  - [ ] Implement clear exception handling: if missing, fail gracefully with instructions directing the user to place the UCI Online Retail dataset at `backend/data/raw/Online Retail.xlsx`.
  - [ ] Implement Excel-to-Parquet initial cache converter (`backend/data/processed/raw.parquet`) to eliminate repeated slow `.xlsx` reads.

---

### Phase 2: Data Preprocessing Pipeline (Milestone M2)

- [ ] **2.1 Raw Data Profiler**
  - [ ] Calculate raw profile metrics on `Online Retail.xlsx`:
    - Total record count (expect 541,909 rows, 8 columns).
    - Distinct invoice counts, distinct stock codes, identified customer IDs, countries.
    - Missing value counts across all columns (`Description`, `CustomerID`, etc.).
  - [ ] Save output as `backend/results/raw_profile.json` comparing recomputed figures against CA1 reference figures side by side.
- [ ] **2.2 Preprocessing Engine Implementation (`backend/app/services/preprocessing.py`)**
  - [ ] Implement step-by-step pipeline tracking `{step, rule, rows_before, rows_after, rows_removed}`:
    - **Step 1:** Load and inspect raw data.
    - **Step 2:** Missing keys filter — drop missing `InvoiceNo` or `StockCode`. Retain missing `CustomerID`. Handle missing `Description` using most frequent label for valid `StockCode` or `Item <StockCode>`.
    - **Step 3:** Cancellation filter — drop `InvoiceNo` starting with letter `'C'`.
    - **Step 4:** Invalid values filter — drop `Quantity <= 0` and `UnitPrice <= 0` (record removal counts separately).
    - **Step 5:** Non-product filter — exclude non-product codes/descriptions: `POST`, `DOT`, `M`, `BANK CHARGES`, `AMAZONFEE`, `CRUK`, `C2`, `S`, `B`, `D`, `PADS`, `gift_0001_*`, and codes not matching `^\d{5}[A-Za-z]*$`. Log counts per removed code.
    - **Step 6:** Exact duplicate filter — drop identical duplicated transaction rows.
    - **Step 7:** Text standardization — strip spaces, normalize whitespace, uppercase text, build canonical `StockCode -> label` mapping using highest frequency label per code.
    - **Step 8:** Target scope filter — restrict strictly to `Country == "United Kingdom"`.
    - **Step 9:** Basket grouping — group transactions by `InvoiceNo` into sets of unique `StockCode`s.
    - **Step 10:** Basket size filtering — filter out single-item baskets (basket size >= 2). Record total valid baskets vs >=2 baskets denominator decision in `docs/DECISIONS.md`.
    - **Step 11:** Basket encoding (One-Hot / Boolean) — filter out items below support floor (0.5%) to optimize memory; generate sparse boolean transaction matrix for mining.
- [ ] **2.3 Persistence & Artifact Outputs**
  - [ ] Save `backend/data/processed/baskets.parquet`.
  - [ ] Save `backend/data/processed/label_map.json`.
  - [ ] Save `backend/results/preprocessing_log.json`.
  - [ ] Save `backend/results/final_counts.json` (final invoice count, product count, basket count, average basket size).
- [ ] **2.4 Preprocessing Unit Tests (`backend/tests/test_preprocessing.py`)**
  - [ ] Test cancellation identification (`InvoiceNo` starting with `'C'`).
  - [ ] Test removal of non-positive quantity and zero/negative unit price.
  - [ ] Test non-product stock code regex and exclusion list filtering.
  - [ ] Test UK scope isolation.
  - [ ] Test boolean matrix shape and dtype.

---

### Phase 3: Exploratory Data Analysis (EDA) (Milestone M3)

- [ ] **3.1 EDA Service Implementation (`backend/app/services/eda.py`)**
  - [ ] Compute Top 10 products by invoice count in UK dataset (CA1 Viz #1) with human-readable labels.
  - [ ] Compute monthly invoice counts across Dec 2010 – Dec 2011 (annotating Dec 2011 partial month).
  - [ ] Compute basket size distribution (histogram bins, mean, median, IQR).
  - [ ] Compute raw vs cleaned distribution metrics for `Quantity` and `UnitPrice` (demonstrating why cleaning was mandatory).
  - [ ] Compute country market share breakdown from raw data (empirically justifying the UK focus).
- [ ] **3.2 EDA Precomputations & JSON Exports**
  - [ ] Save `backend/results/eda_summary.json` containing precomputed chart data for instant UI rendering.

---

### Phase 4: Association Rule Mining Engine (Milestone M4)

- [ ] **4.1 Core Mining Service (`backend/app/services/mining.py`)**
  - [ ] Implement `run_fpgrowth(basket_matrix, min_support, max_len)` using `mlxtend.frequent_patterns.fpgrowth(..., use_colnames=True)`.
  - [ ] Implement `run_apriori(basket_matrix, min_support, max_len)` using `mlxtend.frequent_patterns.apriori(..., use_colnames=True)`.
  - [ ] Implement `generate_rules(itemsets_df, min_confidence, min_lift)` using `mlxtend.frequent_patterns.association_rules`.
  - [ ] Compute association metrics: Support, Confidence, Lift, Leverage, Conviction (safely handle `inf` -> `None`/`null` for JSON serialization).
  - [ ] Format antecedents and consequents into structured objects: `[{ "code": str, "label": str }]`.
- [ ] **4.2 Rule Post-Processing & Actionability Heuristics**
  - [ ] Flag **Redundant Rules**: detect superset antecedents that offer no confidence improvement over simpler subsets.
  - [ ] Flag **Popularity-Driven Rules**: detect high confidence paired with near-neutral lift (e.g., `lift < 1.10`) or overwhelmingly high consequent support.
  - [ ] Flag **Variant-Product Rules**: identify item pairs sharing base product descriptions differing only by color/design (e.g., "HEART PINK" vs "HEART RED"); tag `rule_type: "variant"` vs `"complementary"`.
  - [ ] Assign boolean flag `actionable: bool` and explanatory string `reason`.
- [ ] **4.3 Correctness Unit Test: CA1 Worked Mini-Example (`backend/tests/test_mini_example.py`)**
  - [ ] Construct the 5-transaction hypothetical dataset from CA1 §7.2:
    - T1: {A, B, C}; T2: {A, C}; T3: {A, D}; T4: {B, C, E}; T5: {A, B, C}
  - [ ] Run with `min_support = 0.40`:
    - Verify frequent 1-itemsets: A (4), B (3), C (4); D and E pruned.
    - Verify frequent 2-itemsets: {A,B} (2), {A,C} (3), {B,C} (3).
    - Verify frequent 3-itemset: {A,B,C} (2).
    - Verify Rule $A \rightarrow C$: Support = 60%, Confidence = 75%, Lift = 0.9375 (~0.94).
    - Verify Rule $B \rightarrow C$: Support = 60%, Confidence = 100%, Lift = 1.25.
  - [ ] Assert FP-Growth and Apriori produce identical itemsets and supports.
- [ ] **4.4 Mining Cache Service (`backend/app/services/cache.py`)**
  - [ ] Implement hashing key `(algorithm, min_support, min_confidence, min_lift, max_len, scope_hash)`.
  - [ ] Cache precomputed runs as serialized JSON/Parquet in `backend/results/cache/`.

---

### Phase 5: Benchmark & Sensitivity Analysis (Milestone M5)

- [ ] **5.1 Algorithm Comparison Engine (`backend/app/services/benchmark.py`)**
  - [ ] Execute comparative runs of Apriori vs FP-Growth on identical UK basket matrices for supports: 2.0%, 1.0%, 0.5% (with `max_len = 4`).
  - [ ] Perform 3 repetitions per configuration to calculate mean execution runtime and standard deviation using `time.perf_counter()`.
  - [ ] Enforce automated equality assertion: verify that `set(itemsets_fpgrowth) == set(itemsets_apriori)` and supports match within float tolerance.
  - [ ] Record peak memory usage using `tracemalloc`.
  - [ ] Graceful timeout handling: if Apriori exceeds timeout (e.g. 120s at 0.5%), log `"timed out after N seconds"` honestly without faking results.
  - [ ] Output `backend/results/benchmark_results.json`.
- [ ] **5.2 Sensitivity Analysis Engine**
  - [ ] Execute parameter sensitivity sweep: `min_support` $\in \{0.5\%, 1.0\%, 2.0\%\}$ with `min_confidence = 0.50`, `min_lift = 1.0`.
  - [ ] For each threshold, record: itemset count, rule count, max lift, median lift, runtime.
  - [ ] Generate natural-language sensitivity summary describing exact scaling behavior.
  - [ ] Output `backend/results/sensitivity_results.json`.

---

### Phase 6: Recommender & Offline Evaluation (Milestone M5)

- [ ] **6.1 Recommendation Engine (`backend/app/services/recommender.py`)**
  - [ ] Build fast lookup index: `antecedent_tuple -> list_of_consequents_with_metrics`.
  - [ ] **Single Product Mode:** Given product $P$, find rules where $P \in \text{antecedent}$, sort consequents by lift (tie-break on confidence), exclude $P$, return top-$k$ with explanation.
  - [ ] **Cart Simulator Mode:** Given cart basket $C = \{p_1, \dots, p_m\}$, identify active rules where $\text{antecedent} \subseteq C$, filter out items already in $C$, aggregate candidate scores (max lift / confidence), return top-$k$ with multi-item explanation ("because cart contains...").
  - [ ] **Fallback Strategy:** If no rules match, return clear empty state with explanation. Provide fallback top-popular products clearly tagged as `"popularity fallback"`.
- [ ] **6.2 Offline Evaluation Engine (Time-Based Split)**
  - [ ] Split dataset chronologically by `InvoiceDate`: 80% train invoices, 20% test invoices.
  - [ ] Re-mine association rules exclusively on train set using default parameters (1% support, 50% confidence).
  - [ ] On test baskets with size $\ge 2$:
    - Perform Leave-One-Out validation across multiple seeds: hide one item at random, input remainder into recommender, request top-$k$ ($k \in \{1, 3, 5\}$).
    - Compute **Hit Rate@k** (proportion of times hidden item is in top-$k$).
    - Compute **Precision@k**.
    - Compute **Coverage** (proportion of test baskets with at least one eligible recommendation).
  - [ ] Implement Popularity Recommender Baseline: evaluate identical test baskets against overall top-selling items.
  - [ ] Compare rule recommender vs popularity baseline with complete scientific honesty (document reasons if baseline performs comparably or better due to wholesale/popular products).
  - [ ] Save output as `backend/results/recommender_eval.json`.
- [ ] **6.3 Rule-to-Decision Matrix Population**
  - [ ] Populate CA1 §9.8 decision matrix with actual mined rules:
    - High support & lift > 1 $\rightarrow$ Complementary product recommendation.
    - Frequent combination with healthy margin $\rightarrow$ Product bundle / promotional offer.
    - High confidence but lift $\approx 1$ $\rightarrow$ Deprioritize (popularity artifact).
    - Out-of-stock item $\rightarrow$ Suppress recommendation until inventory restocked.
  - [ ] Save output as `backend/results/decision_matrix.json`.

---

### Phase 7: Backend API Development & Testing (Milestone M6)

- [ ] **7.1 Pydantic Schemas (`backend/app/schemas.py`)**
  - [ ] Define request and response schemas for all endpoints:
    - Data profiles, preprocessing log steps, final counts.
    - Mining parameters, itemsets, rules, actionability metadata.
    - Benchmark run results, sensitivity points.
    - Recommendation queries and recommendations with explanations.
    - Offline evaluation metrics and decision matrix entries.
- [ ] **7.2 API Endpoints (`backend/app/routers/`)**
  - [ ] `GET /api/health`: service health & precomputed data availability.
  - [ ] `GET /api/data/profile`: raw vs CA1 profile comparisons.
  - [ ] `GET /api/data/preprocessing-log`: detailed cleaning step logs.
  - [ ] `GET /api/data/final-counts`: invoice, product, basket counts.
  - [ ] `GET /api/eda/top-products`, `/api/eda/monthly`, `/api/eda/basket-sizes`: EDA endpoints.
  - [ ] `GET /api/mining/defaults`: default parameters and constraints.
  - [ ] `POST /api/mining/run`: cached / live mining run with guardrails.
  - [ ] `GET /api/mining/rules`: paginated, filterable rules endpoint.
  - [ ] `GET /api/mining/itemsets`: paginated frequent itemsets endpoint.
  - [ ] `GET /api/compare/benchmark` & `POST /api/compare/run`: algorithm comparison endpoints.
  - [ ] `GET /api/sensitivity`: sensitivity analysis results.
  - [ ] `GET /api/recommend/products`: autocomplete search for product labels/codes.
  - [ ] `GET /api/recommend`: single product recommendation.
  - [ ] `POST /api/recommend/basket`: multi-item cart recommendation.
  - [ ] `GET /api/recommend/evaluation`: offline evaluation results.
  - [ ] `GET /api/insights/decision-matrix`: rule-to-decision matrix.
- [ ] **7.3 API Concurrency & Guardrails**
  - [ ] Restrict minimum support floor $\ge 0.005$ with HTTP 422.
  - [ ] Enforce async threadpool execution with 120s timeout.
  - [ ] Concurrency lock to prevent overlapping live CPU-heavy mining runs.
  - [ ] Enable CORS for Vite frontend origin (`http://localhost:5173`).
- [ ] **7.4 API Automated Tests (`backend/tests/test_api.py`)**
  - [ ] Write tests with `fastapi.testclient.TestClient` verifying responses, status codes, and input validation.

---

### Phase 8: Frontend Application Development (Milestone M6)

- [ ] **8.1 Frontend Setup & Architecture**
  - [ ] Scaffold Vite React application with TypeScript and Tailwind CSS in `frontend/`.
  - [ ] Setup TanStack Query (`@tanstack/react-query`) for data caching and API state management.
  - [ ] Setup `react-router-dom` navigation and shared layout (sidebar, top navigation, status badges).
  - [ ] Define TypeScript interfaces matching backend Pydantic schemas.
  - [ ] Create reusable UI components: Stat cards, metric badges, sortable data tables with pagination, loading skeletons, error banners.
- [ ] **8.2 Page 1: Overview & Executive Dashboard**
  - [ ] Display problem statement and business objective (from CA1).
  - [ ] KPI cards from live data: Valid UK Invoices, Distinct Products, Clean Baskets, Discovered Rules, Highest Lift.
  - [ ] Interactive Process Flow diagram: `Problem -> Data -> Preprocessing -> Algorithm -> Results -> Evaluation -> Insights -> Decision`.
- [ ] **8.3 Page 2: Data & Preprocessing**
  - [ ] Side-by-side comparison table: CA1 Reference Figures vs Recomputed Dataset Profile.
  - [ ] Step-by-step Preprocessing Log table with rows before/after/removed.
  - [ ] Waterfall / Step chart showing attrition of rows at each cleaning stage.
  - [ ] Interactive Boolean Matrix mini-inspector displaying a tiny real sample basket.
- [ ] **8.4 Page 3: Exploratory Data Analysis (EDA)**
  - [ ] CA1 Viz #1: Top 10 products by UK invoice count (bar chart with full descriptions).
  - [ ] Monthly invoice volume chart highlighting December 2011 partial observation.
  - [ ] Basket size distribution histogram.
  - [ ] Quantity and UnitPrice distribution chart justifying negative/zero exclusions.
  - [ ] Country share chart showing UK dominance (>90% transactions).
- [ ] **8.5 Page 4: Interactive Mining Explorer**
  - [ ] Parameter control panel: Algorithm selector (FP-Growth vs Apriori), Min Support slider (0.5%–5.0%), Min Confidence slider (10%–100%), Min Lift slider, Max Itemset Length selector.
  - [ ] Run Mining button with runtime display, cache indicator badge, and loading spinner.
  - [ ] Rules Explorer Table: sortable by support, confidence, lift, leverage, conviction; search filter; "Only Actionable" toggle.
  - [ ] Expandable row drawer detailing metrics, item codes, and flags (redundant, popularity-driven, variant).
- [ ] **8.6 Page 5: Advanced Visualizations**
  - [ ] CA1 Viz #2: Top 15 association rules ranked by Lift (horizontal bar chart).
  - [ ] CA1 Viz #3: Support vs Confidence scatter plot with Lift mapped to point color and radius.
  - [ ] Metric distribution histograms (Support, Confidence, Lift).
  - [ ] Interactive Rule Network Graph (visualizing associations between frequent product nodes).
- [ ] **8.7 Page 6: Algorithm Comparison**
  - [ ] CA1 Viz #4: Apriori vs FP-Growth runtime bar chart with error bars across support levels (2%, 1%, 0.5%).
  - [ ] "Results Identical" verification badge and itemset count confirmation.
  - [ ] Conceptual vs Empirical comparison table (theoretical database scans, candidate generation, memory vs empirical runtimes).
- [ ] **8.8 Page 7: Parameter Sensitivity Analysis**
  - [ ] Sensitivity comparison grid table and chart (itemsets, rules, runtime, max lift at 0.5%, 1%, 2% support).
  - [ ] Plain-language auto-generated interpretation of sensitivity trade-offs.
- [ ] **8.9 Page 8: Product Recommender & Cart Simulator**
  - [ ] Product Autocomplete Search bar to test individual product recommendations.
  - [ ] Recommendation Cards: "Customers who bought this also bought" with confidence, lift, and human-readable explanation.
  - [ ] Interactive Cart Simulator: add multiple items, review real-time recommendations, explanations of antecedent matches.
  - [ ] Explicit disclaimer badge: *"Candidate recommendations for A/B testing; not guaranteed revenue uplift."*
- [ ] **8.10 Page 9: Evaluation & Business Impact**
  - [ ] Offline evaluation results chart: Hit Rate@1/3/5, Precision@k, and Coverage vs Popularity Baseline.
  - [ ] Honest evaluation interpretation narrative explaining strengths and limitations.
  - [ ] Dynamic Rule-to-Decision Matrix mapping actual rules to business interventions (recommend, bundle, deprioritize, suppress).
  - [ ] Dedicated *"What This Does and Does Not Show"* section detailing CA1 caveats (no causation, wholesaler bias, seasonality, need for controlled A/B test).
- [ ] **8.11 Page 10: Actionable Business Insights**
  - [ ] Formatted presentation of `docs/INSIGHTS.md` generated from real pipeline data:
    - Top complementary item pairings.
    - Product bundling strategies and promotional kits.
    - Website catalog placement and checkout cross-sell suggestions.
    - Inventory stocking correlation guidelines.
- [ ] **8.12 Page 11: Methodology & Academic Alignment**
  - [ ] Mapping to CA1 sections 1 through 13.
  - [ ] Mathematical definitions of Support, Confidence, Lift, Leverage, Conviction.
  - [ ] CA1 Worked Mini-Example interactive calculator displaying the verification test.
  - [ ] Full academic references cited from CA1.

---

### Phase 9: Analysis Artifacts, Figures & Notebook (Milestone M7)

- [ ] **9.1 Report Figure Generation Script (`backend/scripts/export_figures.py`)**
  - [ ] Export 200 DPI publication-quality PNG figures into `backend/results/figures/`:
    - `top10_products.png`
    - `monthly_invoices.png`
    - `basket_size_hist.png`
    - `preprocessing_waterfall.png`
    - `top_rules_by_lift.png`
    - `support_vs_confidence_lift.png`
    - `rule_metric_histograms.png`
    - `runtime_comparison.png`
    - `sensitivity.png`
    - `recommender_eval.png`
- [ ] **9.2 CSV Data Exports**
  - [ ] Export `backend/results/frequent_itemsets_default.csv`.
  - [ ] Export `backend/results/rules_default.csv`.
  - [ ] Export `backend/results/top20_rules.csv`.
  - [ ] Export `backend/results/preprocessing_log.csv`.
- [ ] **9.3 Reproducible Jupyter Notebook (`notebooks/ca2_analysis.ipynb`)**
  - [ ] Create standalone notebook executing the entire pipeline step by step:
    - Imports directly from `backend/app/services`.
    - Shows raw profile, preprocessing outputs, EDA plots, FP-Growth & Apriori execution, rule generation, recommender evaluation.
    - All cell outputs pre-executed and saved for faculty review.

---

### Phase 10: Decision Support, Insights & Documentation (Milestone M7)

- [ ] **10.1 Architectural Decisions Log (`docs/DECISIONS.md`)**
  - [ ] Document all design choices and justifications:
    - Denominator choice for support (baskets with $\ge 2$ items vs all valid baskets).
    - Threshold floors and caps (`max_len = 4`, support $\ge 0.5\%$).
    - Variant-product heuristic definition (word-token matching).
    - Cart score aggregation methodology.
- [ ] **10.2 Academic Methodology Document (`docs/METHODOLOGY.md`)**
  - [ ] Document complete workflow structured to match CA1 sections 1 to 13.
  - [ ] Detail mathematical formulations, algorithm steps, and library versions.
- [ ] **10.3 Real Business Insights Document (`docs/INSIGHTS.md`)**
  - [ ] Create automated generation script `backend/scripts/generate_insights.py`.
  - [ ] Compile report sections 1–10 from real run outputs:
    1. Cleaned data summary and attrition impact.
    2. Top products analysis.
    3. Top 10 rules translated to business language.
    4. Categorical product themes (giftware, tableware, variants).
    5. High-confidence vs true-lift comparison.
    6. Actionable recommendations categorized by decision type.
    7. Algorithm runtime & memory conclusions.
    8. Honest offline evaluation analysis.
    9. Limitations, assumptions, and controlled A/B test blueprint.
    10. Detailed mapping demonstrating achievement of CA1 Specific Objectives 1–7.
- [ ] **10.4 Project Master README (`README.md`)**
  - [ ] Overview, architecture diagram, tech stack, screenshots.
  - [ ] Clear setup and run instructions (backend, frontend, pipeline execution).
  - [ ] Comprehensive CA2 Requirements Traceability Table mapping each requirement to code and UI pages.

---

### Phase 11: End-to-End Verification & Acceptance Checklist

- [ ] **Pipeline Execution:** Single script `python backend/scripts/run_pipeline.py` executes end-to-end without errors.
- [ ] **Preprocessing Verification:** Preprocessing log matches actual removals; final counts verified.
- [ ] **Scope Verification:** UK-only filtering applied prior to basket generation.
- [ ] **Algorithm Dual Implementation:** Both FP-Growth and Apriori execute; identical itemsets verified.
- [ ] **Parameter Conformance:** Default min support = 1%, min confidence = 50%, min lift > 1.
- [ ] **Sensitivity Analysis:** 0.5%, 1%, 2% support levels computed and compared.
- [ ] **Visualizations:** All 4 required CA1 visualizations implemented and populated with real data.
- [ ] **Recommender Functionality:** Single product and multi-item cart recommendations work with clear explanations.
- [ ] **Offline Evaluation:** 80/20 time split completed; hit rates reported honestly against baseline.
- [ ] **Decision Matrix:** Mined rules mapped to practical business actions.
- [ ] **Integrity Guarantee:** Zero hard-coded or fabricated numbers; strict adherence to correlation vs causation language.
- [ ] **Mini-Example Sanity Check:** CA1 worked example unit test passes ($A \rightarrow C$ lift ~0.94, $B \rightarrow C$ lift 1.25).
- [ ] **Report Artifacts:** Figures (200 dpi PNGs), CSV tables, and notebook fully generated.

