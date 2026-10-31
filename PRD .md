# Product Requirements Document (PRD)

**Product:** Market Basket Analysis & Product Recommendation – Decision-Support Web App
**Project type:** CA2 implementation (follows CA1 case study)
**Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B
**Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)
**Guide:** Sukanya Roychowdhury
**Status:** Draft v1.0
**Companion document:** `ANTIGRAVITY_SPEC.md` (technical build instructions). This PRD says *what and why*; the spec says *how*.

---

## 1. Overview

### 1.1 Summary
A full-stack web application that applies association rule mining (FP-Growth and Apriori) to the UCI Online Retail dataset to discover which products are bought together, evaluates the discovered rules, and turns the best rules into product recommendations that support cross-selling, bundling, and website-placement decisions for an online retailer.

### 1.2 Nature of the product
This is a **decision-support system**, not a predictive or decision-making model. Association rule mining is descriptive (unsupervised); no model is trained. The app presents evidence (support, confidence, lift) and a shortlist of candidate actions for a human to decide on and later validate with an A/B test.

### 1.3 Relationship to CA1
CA1 defined the problem, dataset, preprocessing plan, algorithms, parameters, and evaluation measures. CA2 implements exactly that plan. Anything fixed in CA1 is a requirement here (see section 7).

---

## 2. Problem Statement

An online retailer sells thousands of products. Customers cannot browse them all, and the business cannot manually inspect hundreds of thousands of transaction lines to see what sells together. As a result it can miss cross-selling opportunities, place products poorly, and run promotions without evidence.

**Core question (from CA1):** How can historical retail transactions be analysed to discover which products are frequently purchased together, so the retailer can generate data-driven recommendations and cross-selling strategies?

---

## 3. Goals and Non-Goals

### 3.1 Goals
| ID | Goal |
|---|---|
| G1 | Clean the Online Retail data with a transparent, reproducible, logged preprocessing pipeline |
| G2 | Implement FP-Growth (primary) and Apriori (comparison) and verify they return identical frequent itemsets |
| G3 | Generate and evaluate association rules using support, confidence, and lift |
| G4 | Present results through clear, appropriate visualizations |
| G5 | Interpret results in plain business language and explain the insights |
| G6 | Demonstrate the business goal through a working recommender and an honest offline evaluation |
| G7 | Let a user explore the mining interactively by changing thresholds |
| G8 | Produce exports (figures, CSVs, notebook, insights) that make writing the CA2 report straightforward |

### 3.2 Non-Goals
- Training or tuning a predictive ML model; GPU use.
- Claiming causation, revenue uplift, or AOV improvement. The data has no impressions, clicks, or control group.
- Real-time ingestion of live store data, user accounts, payments, or a real e-commerce storefront.
- Analysing countries other than the UK in the primary analysis (a secondary all-country run is optional only if time permits).
- Customer-level analysis (segmentation, CLV) unless added later as an extension.

---

## 4. Users and Use Cases

| Persona | Description | Main needs |
|---|---|---|
| **Examiner / Faculty** | Evaluates CA2 against the stated requirements | Quickly see dataset, preprocessing, algorithms, results, visualizations, interpretation, and business link; trust that numbers are real |
| **Retail business analyst** (simulated stakeholder) | Wants to know which products to pair, bundle, or place together | Ranked, understandable rules; ability to filter out weak or obvious ones; clear next actions |
| **Team members** | Build, demo, and write the report | Reproducible pipeline, exports, notebook, clear structure |

### Key user stories
1. As an examiner, I can see exactly how many rows each cleaning step removed so I can judge data quality handling.
2. As an analyst, I can change minimum support, confidence, and lift and see rules update, so I can balance coverage and quality.
3. As an analyst, I can sort and filter rules and hide redundant, popularity-driven, or colour-variant rules to focus on actionable ones.
4. As an analyst, I can pick a product (or build a cart) and see "customers who bought this also bought" suggestions with a plain explanation.
5. As an examiner, I can see Apriori and FP-Growth compared fairly, including confirmation that they return the same itemsets.
6. As an analyst, I can see which action (recommend, bundle, de-prioritise, suppress) each type of rule supports.
7. As an examiner, I can see an honest offline evaluation of the recommender against a popularity baseline.
8. As a team member, I can export figures and tables for the written report.

---

## 5. Scope

### 5.1 In scope
- Data loading, profiling, cleaning, UK filtering, basket construction, one-hot encoding.
- EDA (top products, monthly trend, basket sizes, quantity/price outliers, country share).
- FP-Growth and Apriori, rule generation, rule metrics and actionability flags.
- Sensitivity analysis (0.5%, 1%, 2% support).
- Algorithm benchmark (runtime and itemset counts, repeated runs).
- Product and cart recommender with explanations.
- Offline evaluation using a time-based train/test split.
- Rule-to-decision mapping with real example rules.
- Interactive web UI, REST API, deployment, exports, notebook, documentation.

### 5.2 Out of scope (for now)
Authentication, multi-user data upload, persistent database, A/B test infrastructure, mobile app, other datasets.

### 5.3 Optional extensions (only if time allows)
Upload-your-own-CSV analysis, all-country comparison, rule network graph polish, lift heatmap.

---

## 6. Functional Requirements

Priority: **P0** = must have for CA2, **P1** = should have, **P2** = nice to have.

### 6.1 Data and preprocessing
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Load `Online Retail.xlsx` and cache it for fast reloads; show a clear error if the file is missing, including where to place it | P0 |
| FR-2 | Show a raw-data profile (rows, columns, types, missing values, distinct counts) next to the CA1 reference figures | P0 |
| FR-3 | Apply cleaning rules in order: missing keys, cancellations (invoice prefix "C"), non-positive quantity or price, non-product codes, exact duplicates, text standardisation | P0 |
| FR-4 | Log rows before, after, and removed for every cleaning step, and display the log in the UI | P0 |
| FR-5 | Apply UK-only scope before basket construction | P0 |
| FR-6 | Build baskets (distinct StockCodes per invoice), exclude single-item baskets, and state the support denominator used | P0 |
| FR-7 | One-hot encode baskets to a boolean matrix; drop items that cannot reach the lowest support threshold to save memory | P0 |
| FR-8 | Report final invoice, product, and basket counts, and average basket size | P0 |

### 6.2 Exploration
| ID | Requirement | Priority |
|---|---|---|
| FR-9 | Top 10 products by number of valid UK invoices (bar chart) | P0 |
| FR-10 | Invoices per month, with a note that December 2011 is a partial month | P1 |
| FR-11 | Basket size distribution | P1 |
| FR-12 | Quantity and UnitPrice distributions that justify the cleaning rules | P1 |
| FR-13 | Country share of the raw data, justifying UK scope | P2 |

### 6.3 Mining and evaluation
| ID | Requirement | Priority |
|---|---|---|
| FR-14 | Implement FP-Growth as the primary algorithm | P0 |
| FR-15 | Implement Apriori on the same matrix, support, and max itemset length | P0 |
| FR-16 | Verify both return identical frequent itemsets and show the result | P0 |
| FR-17 | Generate rules with default minimum confidence 50% and lift greater than 1 | P0 |
| FR-18 | Compute and display support, confidence, lift; also leverage and conviction | P0 |
| FR-19 | Flag rules as redundant, popularity-driven (high confidence, lift near 1), or colour-variant; mark each as actionable or not with a reason | P1 |
| FR-20 | Sensitivity analysis at 0.5%, 1%, 2% support showing itemset count, rule count, runtime, and lift summary | P0 |
| FR-21 | Benchmark runtime of both algorithms (repeated runs, mean and spread); record a timeout honestly if one occurs | P0 |
| FR-22 | Pass the CA1 worked mini-example as a correctness test (A to C lift about 0.94; B to C lift 1.25) | P0 |

### 6.4 Interactive exploration
| ID | Requirement | Priority |
|---|---|---|
| FR-23 | Mining Explorer page with controls for algorithm, min support, min confidence, min lift, max itemset length, and a Run button | P0 |
| FR-24 | Precomputed default results load instantly; live re-run for custom thresholds, cached by parameters | P0 |
| FR-25 | Guard rails: minimum support floor, timeout, one live run at a time, clear error messages | P0 |
| FR-26 | Rules table: sortable, searchable, paginated, filter by actionability, expandable detail row | P0 |

### 6.5 Visualizations
| ID | Requirement | Priority |
|---|---|---|
| FR-27 | Bar chart of top rules by lift (CA1 visualization) | P0 |
| FR-28 | Scatter plot of support vs confidence with lift as colour or size (CA1 visualization) | P0 |
| FR-29 | Bar chart comparing Apriori and FP-Growth runtime (CA1 visualization) | P0 |
| FR-30 | Histograms of support, confidence, and lift | P1 |
| FR-31 | Rule network graph of top rules | P2 |
| FR-32 | Every chart has a title, axis labels, tooltip, and a one-line caption | P0 |

### 6.6 Recommender and business impact
| ID | Requirement | Priority |
|---|---|---|
| FR-33 | Product search with autocomplete using readable product names | P0 |
| FR-34 | Single-product recommendations ranked by lift (ties by confidence), each with an explanation | P0 |
| FR-35 | Cart simulator: recommendations for several products, excluding items already in the cart | P0 |
| FR-36 | If no rule applies, show an empty state with a reason; any popularity fallback must be labelled as a fallback | P1 |
| FR-37 | Offline evaluation with a time-based split: hit rate at k, precision at k, coverage, versus a popularity baseline, reported honestly whatever the outcome | P0 |
| FR-38 | Rule-to-decision matrix (recommend, bundle, do not prioritise on confidence, suppress if unavailable) populated with real rules | P0 |
| FR-39 | A "what this does and does not show" section stating CA1 caveats: no causation, no revenue claim, A/B test required, wholesale customers, UK only, seasonality | P0 |

### 6.7 Insights and exports
| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Insights page and document generated from real results: top rules in plain language, themes, popularity vs genuine association, decisions by type, limitations, next steps | P0 |
| FR-41 | A closing paragraph mapping results to the seven CA1 specific objectives | P0 |
| FR-42 | Export report-ready figures (PNG) and tables (CSV) | P0 |
| FR-43 | A notebook that reproduces the pipeline end to end with outputs saved | P1 |
| FR-44 | Methodology page mapping steps to CA1 sections, with formulas and parameters used | P1 |

---

## 7. Fixed Constraints (inherited from CA1)

| Item | Constraint |
|---|---|
| Dataset | UCI Online Retail, 541,909 rows, 8 columns, 1 Dec 2010 to 9 Dec 2011 |
| Scope | United Kingdom invoices only, applied before basket building, same for all algorithms |
| Basket | Invoice as basket; distinct StockCodes as items; Description as label |
| Encoding | Presence/absence, not quantity |
| Algorithms | FP-Growth primary, Apriori for comparison |
| Parameters | Support 0.5%, 1% (default), 2%; confidence 50%; lift greater than 1 |
| Claims | Associations are not causation; business impact is measured only after deployment through a controlled test |
| Reporting | Exact post-cleaning counts must be recomputed and shown, not copied from CA1 reference figures |

---

## 8. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Integrity** | No hard-coded or invented numbers anywhere; every figure comes from the pipeline |
| **Reproducibility** | Fixed random seeds, pinned dependency versions, a single command to run the pipeline, documented decisions |
| **Performance** | Precomputed pages load in about 2 seconds on a warm server; live runs at 1% support or higher finish within the timeout (default 120 s); no run may freeze the server |
| **Resource use** | Preprocessing runs locally; the hosted backend serves small precomputed files and light live runs only |
| **Usability** | Clean, responsive layout for laptop and tablet; loading, empty, and error states on every page; plain-language captions for non-technical readers |
| **Accessibility** | Sufficient colour contrast; charts do not rely on colour alone |
| **Quality** | Automated tests for preprocessing, mining (including the mini-example), the API, and the recommender; linting for backend and frontend |
| **Resilience** | A clear "run the pipeline first" message when results are missing; graceful timeout handling |
| **Security** | CORS restricted to the frontend origin; input validation on all parameters; no secrets in the repo |
| **Maintainability** | Modular services, typed API schemas shared with the frontend types, README and methodology docs |

---

## 9. Data Requirements

- **Source:** UCI Machine Learning Repository, Online Retail (Chen, 2015), placed manually at `backend/data/raw/Online Retail.xlsx`.
- **Raw fields:** InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country.
- **Known issues to handle:** cancellations, negative quantities, zero prices, non-product codes (postage, bank charges, manual adjustments), missing descriptions and customer IDs, duplicate rows, inconsistent descriptions per code, many wholesale customers, a partial final month.
- **Storage:** parquet and JSON files only; raw and processed data are git-ignored; small precomputed results are what gets deployed.

---

## 10. Success Metrics

### 10.1 Data-mining level (from CA1 section 2.4)
- Interpretable rules that meet support and confidence thresholds with lift greater than 1, ranked for business review.
- Both algorithms compared on the same scope and thresholds, with identical itemsets confirmed.
- Sensitivity analysis completed at three support levels.
- Cleaning log complete, with final counts reported.

### 10.2 Business level
- A shortlist of candidate recommendations, bundles, and placement ideas, each tied to a specific real rule.
- Offline evaluation reported honestly (hit rate and coverage versus a popularity baseline). The result is informative whether the rules win or lose.
- Business impact (click-through rate, conversion rate, AOV, incremental revenue) is explicitly deferred to a post-deployment A/B test, with a proposed test design.

### 10.3 Project level
- Every CA2 requirement is demonstrably met (see section 11).
- App runs end to end from the raw file with documented commands.
- Hosted demo works and a local backup is ready for the presentation.

---

## 11. Traceability to CA2 Requirements

| CA2 requirement | Where it is met |
|---|---|
| Use a relevant dataset and perform necessary preprocessing | FR-1 to FR-8; Data & Preprocessing page; preprocessing log |
| Implement at least one data mining algorithm | FR-14, FR-15 (FP-Growth and Apriori) |
| Generate and evaluate the results | FR-16 to FR-22; Mining Explorer; Sensitivity; Algorithm Comparison |
| Include appropriate visualizations | FR-9 to FR-12, FR-27 to FR-32 |
| Interpret the results and explain insights | FR-40, FR-41; Insights page |
| Demonstrate how the implementation helps achieve the business goal | FR-33 to FR-39; Recommender page; Evaluation & Impact page |

---

## 12. Milestones

| # | Milestone | Output |
|---|---|---|
| M1 | Scaffold and data loading | Repo, config, raw profile |
| M2 | Preprocessing | Cleaning log, baskets, final counts, tests |
| M3 | Exploration | EDA data and charts |
| M4 | Mining | FP-Growth, Apriori, rules, flags, mini-example test, sensitivity |
| M5 | Benchmark, recommender, offline evaluation | Comparison results, recommender, evaluation metrics |
| **Checkpoint** | Team reviews the real numbers and decides on visualization and insight emphasis | Go/no-go for UI |
| M6 | API and frontend | Working app with all pages |
| M7 | Exports and deployment | Figures, CSVs, notebook, insights, hosted demo |

Suggested effort split: about 25% data and preprocessing, 35% mining, benchmark, recommender and evaluation, 30% frontend, 10% deployment and exports. If time runs short, M1 to M5 plus the notebook and exports already cover the core CA2 requirements; the UI is the part to trim first.

---

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Apriori too slow or memory-heavy at 0.5% support | Benchmark incomplete | Cap itemset length at 4, set a timeout, record "timed out" honestly, ask the team before changing parameters |
| Excel loading exhausts memory on a small machine or free host | Pipeline crashes | Preprocess locally, cache as parquet, never load raw data on the hosted backend |
| Few rules survive at 1% support | Weak results | Report sensitivity honestly; ask before changing the pre-registered defaults |
| Rules dominated by colour variants of the same product | Insights look trivial | Variant flag, filters, and a theme analysis separating variants from true complements |
| Recommender fails to beat the popularity baseline | Business story weakens | Report honestly and discuss reasons (wholesale buying, seasonality, variants); the honest analysis is still a valid result |
| Free hosting sleeps or is slow | Demo delay | Wake the server before presenting; keep a local backup running |
| Overclaiming business impact | Credibility loss | Fixed wording rules; dedicated caveats section; A/B test proposed instead of revenue claims |
| Scope creep (extra features) | Missed deadline | P2 items only after all P0 and P1 are done |
| Results differ from CA1 reference figures | Confusion | Show both side by side with an explanation that CA1 figures were raw profile references |

---

## 14. Assumptions and Dependencies

- The team can download the UCI dataset and place it manually; the build agent may not have internet access.
- Python 3.11+, Node.js, and a laptop with roughly 8 GB of RAM or more are available.
- mlxtend, pandas, FastAPI, React, and Recharts are acceptable libraries.
- Free-tier hosting is acceptable for the demo; paid hosting is optional.
- Single-item baskets are excluded from mining, and itemset length is capped at 4 (both recorded as decisions and changeable).

---

## 15. Open Questions

1. Which support denominator should be shown as primary: all valid UK baskets, or only baskets with two or more items? (Default: two or more items, documented.)
2. Should a secondary all-country analysis be included if time permits?
3. Should the hosted version restrict live runs to 1% support or higher, or use a paid instance for 0.5%?
4. Which hosting providers will the team use (backend and frontend)?
5. Is the written CA2 report format fixed by the course (sections, page limits) so exports can be shaped to match?

---

## 16. Out-of-Scope Wording for the Report

When describing the project in the report and demo, use: "decision-support system", "candidate recommendations", "associations, not causation", "offline evaluation", and "to be validated by an A/B test". Avoid: "decision model", "predicts customer behaviour", "increases sales", "proves", or "guarantees".

---

## 17. Glossary

| Term | Meaning |
|---|---|
| Basket | All distinct products in one invoice |
| Support | Share of baskets containing an itemset |
| Confidence | Share of baskets with X that also contain Y |
| Lift | Confidence divided by the support of Y; above 1 means a positive association |
| Frequent itemset | Itemset whose support meets the minimum threshold |
| FP-Growth | Frequent-itemset algorithm using a compressed FP-tree, no candidate generation |
| Apriori | Frequent-itemset algorithm using candidate generation and pruning |
| Hit rate at k | Share of test baskets where the hidden item appears in the top k recommendations |
| Coverage | Share of test baskets for which the recommender can produce any suggestion |
| A/B test | Controlled experiment used after deployment to measure real business impact |
