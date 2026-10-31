# CA2 – Market Basket Analysis & Product Recommendation (Full-Stack App)

> **Instruction file for Antigravity.** Read this whole file before writing any code. It is the single source of truth for the project. Follow it exactly; where it says "decide and document", make a choice and record it in `docs/DECISIONS.md`.

---

## 0. Project context

- **Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B.
- **Assessment:** CA2 = *implementation* of the same case study chosen in CA1.
- **Case study:** *Market Basket Analysis and Product Recommendation Using Association Rule Mining* (Retail / E-Commerce).
- **Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69).

### CA2 requirements (all must be demonstrably met)

1. Use a relevant dataset and perform necessary preprocessing.
2. Implement at least ONE data mining algorithm (we implement **two**: FP-Growth primary, Apriori comparison).
3. Generate and evaluate the results.
4. Include appropriate visualizations.
5. Interpret the results and explain the insights obtained.
6. Demonstrate how the implementation helps achieve the business goal.

### Business goal (from CA1)

Analyse historical retail transactions to find reliable product associations, and use the best rules to shortlist **complementary-product recommendations and cross-selling opportunities**. The analysis supports evidence-based decisions; it does **not** prove revenue or AOV uplift (no impressions/clicks/control group in the data; that needs an A/B test after deployment).

---

## 1. Non-negotiable rules (consistency with CA1)

These were pre-registered in CA1. Do not deviate.

| Item | Rule |
|---|---|
| Dataset | UCI **Online Retail** (id 352), 541,909 rows, 8 columns, 1 Dec 2010 – 9 Dec 2011 |
| Scope | **United Kingdom invoices only**, applied *before* basket construction, identical for all algorithms |
| Basket key | `InvoiceNo`; items = distinct `StockCode`; `Description` is the readable label |
| Encoding | Boolean presence/absence (quantity NOT used) |
| Primary algorithm | **FP-Growth** |
| Comparison algorithm | **Apriori**, same baskets, same support, same `max_len` |
| Sensitivity thresholds | min support **0.5%, 1%, 2%** (1% is the starting/default) |
| Min confidence | **50%** default |
| Min lift | **> 1** (keep rules with lift > 1) |
| Reporting | Support, confidence, lift (also show leverage, conviction as extras) |
| Causation | Never claim causation or guaranteed revenue. Use wording like "candidate for testing" |

### Honesty rules (very important)

- **Never hard-code or invent results.** Every number shown in the UI, README, or insights must come from the actual pipeline run.
- CA1 reported *raw-data reference figures* (about 25,900 invoices, 4,070 stock codes, 4,372 customers, 38 countries, 1,454 missing descriptions, 135,080 missing CustomerIDs). The pipeline must **recompute exact figures** from the downloaded file and **print/log the rows removed at each cleaning step**, final invoice count, final product count and final basket count (CA1 promised this).
- If computed numbers differ from CA1 reference figures, that is expected: show both and note why.

---

## 2. Tech stack (decided)

- **Backend:** Python 3.11+, **FastAPI**, Uvicorn, pandas, numpy, **mlxtend** (`fpgrowth`, `apriori`, `association_rules`), pyarrow (parquet cache), openpyxl (read the .xlsx), matplotlib (static figure export for the report), pydantic v2.
- **Frontend:** **React** (Vite, TypeScript), **Recharts** for charts, `react-router-dom`, TanStack Query for data fetching, Tailwind CSS for styling. Network graph: `react-force-graph-2d` or `vis-network` (optional but nice).
- **Storage:** no database required. Use parquet/JSON files under `backend/data/` and `backend/results/`. (SQLite is allowed only if you have a clear reason; document it.)
- **Tooling:** `requirements.txt`, `package.json`, a root `README.md`, `Makefile` or simple scripts for run commands.

---

## 3. Repository structure

```
ca2-market-basket/
├─ README.md
├─ docs/
│  ├─ DECISIONS.md            # every judgement call + reasons
│  ├─ METHODOLOGY.md          # steps matching CA1 sections
│  └─ INSIGHTS.md             # generated from real results (see §9)
├─ backend/
│  ├─ requirements.txt
│  ├─ app/
│  │  ├─ main.py              # FastAPI app, CORS, routers
│  │  ├─ config.py            # paths, defaults, limits
│  │  ├─ schemas.py           # pydantic models
│  │  ├─ routers/
│  │  │  ├─ data.py           # profile, preprocessing log, EDA
│  │  │  ├─ mining.py         # run/get itemsets & rules
│  │  │  ├─ compare.py        # Apriori vs FP-Growth
│  │  │  ├─ sensitivity.py    # 0.5/1/2% grid
│  │  │  ├─ recommend.py      # recommender + offline evaluation
│  │  │  └─ insights.py       # decision mapping
│  │  └─ services/
│  │     ├─ preprocessing.py
│  │     ├─ eda.py
│  │     ├─ mining.py
│  │     ├─ benchmark.py
│  │     ├─ recommender.py
│  │     └─ cache.py
│  ├─ scripts/
│  │  ├─ run_pipeline.py      # offline: preprocess + mine + save everything
│  │  └─ export_figures.py    # PNG figures for the written report
│  ├─ data/
│  │  ├─ raw/                 # user places Online Retail.xlsx here (gitignored)
│  │  └─ processed/           # parquet caches
│  ├─ results/                # precomputed JSON/parquet outputs, figures/
│  └─ tests/
├─ frontend/
│  └─ (Vite React TS app)
└─ notebooks/
   └─ ca2_analysis.ipynb      # same pipeline, step by step, with outputs
```

---

## 4. Data acquisition

- The dataset must be **placed manually** at `backend/data/raw/Online Retail.xlsx` (download from https://archive.ics.uci.edu/dataset/352/online+retail). Do not assume network access.
- If the file is missing, the pipeline must fail with a clear message telling the user exactly where to put it and where to download it.
- On first load, read the Excel file once and cache as `backend/data/processed/raw.parquet` (Excel reading is slow).
- `.gitignore` the raw and processed data.

---

## 5. Preprocessing (backend/app/services/preprocessing.py)

Implement as an ordered list of named steps. Each step records `{step, rule, rows_before, rows_after, rows_removed}` into a **preprocessing log** saved to `results/preprocessing_log.json` and shown in the UI (as a table and a waterfall/step chart).

Order:

1. **Load and inspect:** shape, dtypes, describe(), nunique of InvoiceNo/StockCode/CustomerID/Country, missing counts per column. Save as `results/raw_profile.json`.
2. **Missing values:** drop rows with missing `InvoiceNo` or `StockCode`. **Keep** missing `CustomerID` (not needed for invoice-level baskets). Missing `Description`: keep if StockCode is valid and label with the most common description for that code, else a code-based label like `Item <StockCode>`. Document the choice.
3. **Cancellations:** drop `InvoiceNo` starting with `C`.
4. **Invalid lines:** drop `Quantity <= 0` and `UnitPrice <= 0` (record counts for each rule separately).
5. **Non-product entries:** drop non-product stock codes/descriptions: `POST`, `DOT`, `M`, `BANK CHARGES`, `AMAZONFEE`, `CRUK`, `C2`, `S`, `B`, `D`, `PADS`, `gift_0001_*` vouchers, and anything whose StockCode does not match `^\d{5}[A-Za-z]*$`. Log which codes were removed and how many rows each.
6. **Exact duplicates:** drop exact duplicate rows. Do NOT dedupe repeated products within an invoice at row level for any reason other than exact duplication; presence is handled in step 9.
7. **Text cleaning:** strip whitespace, collapse spaces, uppercase descriptions. Build a `StockCode -> label` map using the **most frequent** cleaned description for each code (so one code is one item).
8. **UK scope:** filter `Country == "United Kingdom"` (apply before basket building).
9. **Basket grouping:** group by `InvoiceNo` -> set of distinct StockCodes.
10. **Basket-size filter (decide and document):** drop single-item baskets for rule mining (a 1-item basket cannot contain a pair). Log how many were removed. Support must still be reported relative to the stated denominator; **state clearly which denominator is used** (all valid baskets vs baskets with >= 2 items). Default: use baskets with >= 2 items, and record the choice in DECISIONS.md.
11. **One-hot encode:** build a boolean matrix. To keep memory low, **first drop items that cannot reach the lowest support threshold used (0.5%)**; use a sparse boolean DataFrame or `TransactionEncoder` with `sparse=True`.

Outputs saved: `processed/baskets.parquet` (invoice, items, date), `processed/label_map.json`, `results/preprocessing_log.json`, `results/final_counts.json` (final invoice count, product count, basket count, avg basket size).

Add pytest tests: cancellation removal, "C" prefix, quantity/price filters, non-product removal, UK filter, one-hot shape and dtype.

---

## 6. Exploratory data analysis (services/eda.py)

Computed from the **cleaned UK data** and served via API:

- Top 10 products by **number of valid UK invoices** containing them (CA1 visualisation #1), with labels.
- Busiest months (invoices per month), showing the Dec 2010 – Dec 2011 range (note Dec 2011 is partial, ends 9 Dec).
- Basket size distribution (histogram).
- Quantity and UnitPrice distributions (log scale, flag outliers) from the **pre-filter** data to explain why filtering was needed.
- Orders by hour/day of week (optional).
- Countries share in the raw data (to justify UK scope).

---

## 7. Mining (services/mining.py)

### 7.1 Functions

```python
run_fpgrowth(basket_matrix, min_support, max_len) -> itemsets_df
run_apriori(basket_matrix, min_support, max_len) -> itemsets_df
generate_rules(itemsets_df, min_confidence, min_lift=1.0) -> rules_df
```

- Use `mlxtend.frequent_patterns` with `use_colnames=True`.
- `max_len = 4` for both algorithms by default (decide and document; needed so Apriori finishes at 0.5%).
- Rules: `association_rules(itemsets, metric="confidence", min_threshold=min_confidence)`, then filter `lift > min_lift`.
- Keep columns: antecedents, consequents, antecedent support, consequent support, support, confidence, lift, leverage, conviction (replace `inf` conviction with `null` in JSON).
- Convert frozensets to lists of `{code, label}` for the API.

### 7.2 Post-processing / actionability (CA1 §8.2e)

- Flag **redundant** rules (same itemset, one is a subset-antecedent with no better confidence).
- Flag **popularity-driven** rules: confidence high but lift near 1 (e.g. lift < 1.1) or consequent support very high.
- Flag **variant-product rules**: items whose labels share the same base name differing only by colour/design (e.g. "... RED", "... BLUE", "... PINK"). These are real but less interesting; include a `rule_type` field: `variant` or `complementary`. (Simple heuristic: shared first N words of the label; document it.)
- Add `actionable: bool` and `reason` fields.

### 7.3 Caching

- Cache every result keyed by `(algorithm, min_support, min_confidence, min_lift, max_len, scope_hash)` under `results/cache/`.
- **Precompute** on `run_pipeline.py`: default run (FP-Growth, 1% support, 50% conf, lift > 1) plus the full sensitivity grid and the benchmark.

---

## 8. Backend API (FastAPI)

All JSON. Enable CORS for the Vite dev origin. Add an OpenAPI description to each route.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | status + whether precomputed results exist |
| GET | `/api/data/profile` | raw profile (CA1 reference vs recomputed) |
| GET | `/api/data/preprocessing-log` | step log table |
| GET | `/api/data/final-counts` | invoices, products, baskets, avg size |
| GET | `/api/eda/top-products?n=10` | top products by invoice count |
| GET | `/api/eda/monthly` | invoices per month |
| GET | `/api/eda/basket-sizes` | histogram data |
| GET | `/api/mining/defaults` | default parameters + allowed ranges |
| POST | `/api/mining/run` | body: algorithm, min_support, min_confidence, min_lift, max_len -> itemsets count, rules count, runtime, top rules. Uses cache, otherwise runs live |
| GET | `/api/mining/rules` | query: sort_by, order, limit, offset, min_lift, min_conf, search, only_actionable |
| GET | `/api/mining/itemsets` | frequent itemsets (paged) |
| GET | `/api/compare/benchmark` | Apriori vs FP-Growth runtime and itemset counts (precomputed) |
| POST | `/api/compare/run` | live benchmark on chosen supports (with timeout) |
| GET | `/api/sensitivity` | grid for 0.5/1/2%: itemsets, rules, runtime, top lift |
| GET | `/api/recommend/products?q=` | product search (autocomplete) |
| GET | `/api/recommend?stock_code=&k=5` | recommendations for one product |
| POST | `/api/recommend/basket` | body: list of stock codes -> top-k recommendations for the whole cart |
| GET | `/api/recommend/evaluation` | offline evaluation metrics (see §10) |
| GET | `/api/insights/decision-matrix` | CA1 §9.8 mapping filled with real rules |

### Guard rails for live runs

- Floor `min_support >= 0.005` (configurable in `config.py`); reject lower with HTTP 422 and a helpful message.
- Run mining in a threadpool, with a **timeout** (default 120 s) and a clear error if exceeded.
- Allow only one live run at a time (simple lock) and reuse cache.
- Return `runtime_seconds`, `n_baskets`, `n_items`, `n_itemsets`, `n_rules`, and `from_cache`.

---

## 9. Benchmark, sensitivity and evaluation

### 9.1 Algorithm comparison (CA1 §8.2d)

- Same boolean matrix, same support, same `max_len`. Time with `time.perf_counter()`; run each configuration **3 times**, report mean and std.
- Compare at 2%, 1%, 0.5%. If Apriori exceeds the timeout at 0.5%, **record "timed out after N s"** instead of leaving it blank; never fake a number.
- **Assert** both algorithms return the identical set of itemsets (and supports within float tolerance) for each configuration; show "results identical: yes/no" in the UI. This verifies the CA1 claim that both produce the same itemsets.
- Optionally record peak memory with `tracemalloc` (document that it is approximate).

### 9.2 Sensitivity analysis (CA1 §6.4)

- Grid: support in {0.5%, 1%, 2%} at confidence 50%, lift > 1. Table and chart: itemsets, rules, runtime, max lift, median lift.
- Add a short generated sentence describing how thresholds change counts (e.g. "lowering support from 1% to 0.5% increased rules from X to Y") using the real numbers.

### 9.3 Rule evaluation

- Metrics: support, confidence, lift (required), leverage, conviction (extra).
- Show distributions (histograms) of support, confidence and lift.
- Top-N tables: by lift, by confidence, by support; each filterable by actionability.

---

## 10. Recommender and offline evaluation (this demonstrates the business goal)

### 10.1 Recommender

- Build an index `antecedent -> [(consequent, confidence, lift, support)]` from the rules (single-item and multi-item antecedents).
- **Single product:** return top-k consequents ranked by lift, break ties by confidence; exclude items equal to the query.
- **Cart:** for a basket, collect rules whose antecedent is a subset of the cart, exclude items already in the cart, aggregate scores per candidate (e.g. max lift, or sum of confidence; decide and document), return top-k with an **explanation** ("because the cart contains X: confidence 62%, lift 4.1").
- If no rule applies, return an empty list with a reason, **not** random items. A fallback of "popular items" may be offered but must be labelled as a fallback.
- Show product names (labels), never only codes.

### 10.2 Offline evaluation (leave-one-out, time-based split)

Purpose: show the rules generalise to unseen baskets. This is an *offline proxy*, not proof of revenue (CA1 §2.4 and §9.6).

1. Split invoices **by time**: first 80% (train) to mine rules, last 20% (test) for evaluation. Re-mine on train only (same default thresholds).
2. For each test basket with >= 2 items, hide one item at random (fixed seed; repeat over several seeds), give the rest to the recommender, take top-k (k in {1, 3, 5}).
3. Metrics: **Hit rate@k** (hidden item appears in top-k), **coverage** (share of test baskets for which at least one recommendation exists), **precision@k**, and a baseline **popularity recommender** hit rate@k for comparison.
4. Report whether the rule-based recommender beats the popularity baseline, **whatever the result is**. If it does not, say so honestly and discuss why (e.g. wholesale buying, seasonality, variant products).
5. Save to `results/recommender_eval.json` and show on a page with a bar chart (rules vs popularity).

---

## 11. Frontend (React + Vite + TypeScript)

Clean, professional, responsive. Light/dark optional. Consistent colour palette. Every chart has a title, axis labels, tooltips, and a one-line caption stating what it shows. Show loading and error states everywhere.

### Pages

1. **Overview / Dashboard**
   - Problem and objective (short, from CA1), key KPIs from real data: valid UK invoices, products, baskets, rules found, top rule by lift.
   - Pipeline diagram: Problem -> Data -> Preprocessing -> Algorithm -> Results -> Evaluation -> Insights -> Decision (highlight current stage).
2. **Data & Preprocessing**
   - Raw profile vs CA1 reference figures (side by side).
   - Preprocessing log table + step/waterfall chart of rows removed.
   - Before/after counts. One-hot illustration with a tiny real sample.
3. **Exploration (EDA)**
   - Top 10 products bar chart, monthly invoices line/bar, basket size histogram, quantity/price distributions, country share.
4. **Mining Explorer (live)**
   - Controls: algorithm (FP-Growth/Apriori), min support slider (0.5%-5%), min confidence, min lift, max_len. "Run" button.
   - Shows runtime, itemset count, rule count, `from cache` badge, spinner while running, friendly error on timeout/floor violation.
   - Resulting rules table: sortable, searchable, paginated, filter "only actionable"; row expansion shows support/confidence/lift/leverage/conviction and flags (redundant, popularity-driven, variant).
5. **Visualisations**
   - Top rules by lift (bar chart) — CA1 viz #2.
   - **Support vs confidence scatter**, lift as colour/size — CA1 viz #3.
   - Lift/confidence/support histograms.
   - Itemset-size distribution.
   - Rule network graph (nodes = products, edges = rules, edge weight = lift), limited to top ~40 rules.
   - Heatmap of lift for top ~15 items (optional).
6. **Algorithm Comparison**
   - Apriori vs FP-Growth runtime bar chart at each support — CA1 viz #4, with error bars, "identical itemsets: yes/no", itemset counts, and a plain-language conclusion generated from real numbers.
   - Table comparing the two algorithms conceptually (from CA1 §6.3) beside measured results.
7. **Sensitivity**
   - Grid table + chart for 0.5/1/2% support.
8. **Product Recommender (the "business goal" page)**
   - Searchable product dropdown; show "Customers who bought this also bought" cards with confidence/lift and a plain-language explanation.
   - **Cart simulator:** add several products, see recommendations update.
   - Labelled "candidate recommendations for A/B testing, not guaranteed uplift".
9. **Evaluation & Impact**
   - Offline evaluation results (hit rate@k vs popularity baseline, coverage).
   - Rule-to-Decision matrix (CA1 §9.8) filled with **real example rules** for each row: test a recommendation; consider a bundle; do not prioritise on confidence alone; suppress if unavailable.
   - Section "What this does and doesn't show" listing the CA1 caveats (no causation, no revenue claim, A/B test needed, wholesale customers, UK only, seasonality).
10. **Insights**
    - Renders `docs/INSIGHTS.md` content generated from real results (see §12), including bundles, placement, promotion, inventory suggestions.
11. **Methodology / About**
    - Steps mapped to CA1 sections, formulas for support/confidence/lift, parameters used, library versions, limitations, references (reuse CA1 reference list).

Frontend quality bar: TypeScript types matching backend schemas, no hard-coded numbers, accessible colour contrast, works at laptop and tablet widths, no console errors.

---

## 12. Interpretation and insights (docs/INSIGHTS.md)

Generate this **after** the pipeline runs, from real numbers, via a script (`scripts/generate_insights.py`) or by the agent reading `results/`. Must include:

1. **Data summary** (final counts, what cleaning removed and why it mattered).
2. **Top products** and what they suggest.
3. **Top 10 rules** (by lift, with support >= threshold) written in plain business language, e.g. "Baskets containing X contain Y in N% of cases, M times more often than expected."
4. **Patterns and themes:** group rules into themes (e.g. variants/colour sets, party/gift items, kitchen/tea sets) based on real labels. Do not invent themes that the data does not show.
5. **Popularity-driven vs genuinely associated** rules (explain why lift matters, using a real example where confidence is high but lift is low, if one exists).
6. **Recommendations by decision type:** product recommendations, cross-sell, bundling, website placement, inventory/promotions, each tied to specific rules.
7. **Algorithm findings:** same itemsets, runtime difference, memory notes.
8. **Offline evaluation findings** (honest).
9. **Limitations and next steps** (A/B test design: primary metric conversion/AOV, control vs treatment, duration, guardrails).
10. A final **"How this achieves the business goal"** paragraph that maps results to the CA1 objectives 1-7.

---

## 13. Report-support exports

`scripts/export_figures.py` must save high-resolution PNGs (matplotlib, 200 dpi, consistent style) into `backend/results/figures/` for the written CA2 report:

- `top10_products.png`, `monthly_invoices.png`, `basket_size_hist.png`
- `preprocessing_waterfall.png`
- `top_rules_by_lift.png`, `support_vs_confidence_lift.png`, `rule_metric_histograms.png`
- `runtime_comparison.png`, `sensitivity.png`
- `recommender_eval.png`

Also export CSVs: `frequent_itemsets_default.csv`, `rules_default.csv`, `top20_rules.csv`, `preprocessing_log.csv`.

The notebook `notebooks/ca2_analysis.ipynb` must reproduce the whole pipeline top to bottom with outputs saved, using the same service functions (import from `backend/app/services`).

---

## 14. Quality, testing and reproducibility

- Fixed random seeds; pinned versions in `requirements.txt` and `package.json`.
- pytest: preprocessing rules, mining correctness on the **CA1 worked mini-example** (5 transactions T1-T5). Verify: with min support 40%, frequent itemsets are A, B, C, {A,B}, {A,C}, {B,C}, {A,B,C}; rule A->C has support 60%, confidence 75%, lift 0.9375 (about 0.94); rule B->C has support 60%, confidence 100%, lift 1.25. Add this as a unit test and surface it on the Methodology page as a "sanity check".
- Test that FP-Growth and Apriori return identical itemsets on the mini-example and on a small sample of real data.
- API tests with FastAPI `TestClient` for main routes and the guard rails.
- Type-check and lint (ruff/black for Python, eslint for the frontend).
- Handle missing results gracefully: if `run_pipeline.py` has not been run, the UI shows a clear "Run the pipeline first" message with the command.

---

## 15. Run instructions (put in README.md)

```bash
# 1. Place the dataset
backend/data/raw/Online Retail.xlsx

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/run_pipeline.py        # preprocess + precompute everything
python scripts/export_figures.py      # PNGs/CSVs for the report
uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd ../frontend
npm install
npm run dev                            # http://localhost:5173
```

README must also include: project summary, screenshots (add after build), architecture diagram (simple), list of pages, API summary, known limitations, and how each CA2 requirement is satisfied (a table pointing to the page/file).

---

## 16. Build order (follow this sequence)

1. Scaffold repo, config, requirements, gitignore.
2. Preprocessing service + tests + `run_pipeline.py` (print the row-removal log).
3. EDA service.
4. Mining service + mini-example test + rules post-processing.
5. Benchmark + sensitivity + caching.
6. Recommender + offline evaluation.
7. FastAPI routers and schemas; API tests.
8. Frontend scaffold, API client, shared chart components.
9. Pages in the order listed in §11.
10. `export_figures.py`, notebook, `generate_insights.py` -> `docs/INSIGHTS.md`.
11. README, METHODOLOGY, DECISIONS; final end-to-end run; fix issues.

After each major step, run the tests and show the actual output before moving on.

---

## 17. Acceptance checklist

- [ ] Pipeline runs from the raw Excel file to saved results with no manual edits.
- [ ] Preprocessing log shows rows removed per step; final counts printed and shown in UI.
- [ ] UK-only scope applied before basket construction and identical for both algorithms.
- [ ] FP-Growth and Apriori both implemented; identical itemsets verified; runtimes compared fairly.
- [ ] Support, confidence, lift (+ leverage, conviction) computed; rules filtered at lift > 1, confidence >= 50%.
- [ ] Sensitivity at 0.5%, 1%, 2% completed.
- [ ] All four CA1 visualisations present, plus extras.
- [ ] Recommender works for single product and cart, with explanations.
- [ ] Offline evaluation reported honestly vs popularity baseline.
- [ ] Rule-to-Decision matrix filled with real rules.
- [ ] INSIGHTS.md generated from real numbers and covers items 1-10 in §12.
- [ ] No hard-coded results anywhere; no claim of causation or guaranteed revenue.
- [ ] Mini-example unit test passes (A->C lift 0.94, B->C lift 1.25).
- [ ] README, METHODOLOGY, DECISIONS complete; figures and CSVs exported.

---

## 18. Questions to raise with the user (do not guess)

Stop and ask the user if any of these arise:

- The dataset file is missing, corrupted, or differs from the UCI version (different row count).
- Apriori cannot finish at 0.5% even with `max_len = 4` and the timeout (propose a lower `max_len` or a sample, and ask).
- Fewer than about 20 rules survive at the default thresholds (propose lowering support, and ask before changing the pre-registered defaults).
- Any requested change would contradict a rule in §1.
