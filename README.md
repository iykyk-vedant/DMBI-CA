# Market Basket Analysis & Product Recommendation (DMBI CA2)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Tests-9%2F9_Passing-brightgreen.svg?logo=pytest&logoColor=white)](https://pytest.org)

An enterprise-grade **decision-support web application** implementing Association Rule Mining on historical e-commerce transactions to discover frequent product affinities and generate data-driven recommendation strategies.

Built for **Continuous Assessment - 2 (CA2)** following the pre-registered case study specification in CA1.

---

## 👥 Project Team & Context

- **Institution:** Vivekanand Education Society's Institute of Technology (V.E.S.I.T. Autonomous)
- **Department:** Department of Information Technology
- **Course:** Data Mining and Business Intelligence (DMBI), Semester-5, Class D15B (Academic Year 2026–27)
- **Course Faculty Guide:** Sukanya Roychowdhury
- **Student Team:**
  - **Vedant Gharat** (Roll No. 50)
  - **Ayush Lokhande** (Roll No. 55)
  - **Deepak Nishad** (Roll No. 59)
  - **Ayush Yadav** (Roll No. 69)

---

## 🚀 Key Highlights & Architectural Features

1. **Dual Algorithm Implementation:** Implements both **FP-Growth** (primary) and **Apriori** (comparative benchmark) on identical basket matrices and support thresholds, verifying that both algorithms produce 100% mathematically identical frequent itemsets.
2. **Transparent 11-Step Preprocessing Pipeline:** Tracks exact rows before, after, and removed at every transformation step into a structured audit log (`preprocessing_log.json`).
3. **Multi-Metric Evaluation:** Evaluates rules using Support, Confidence, Lift, Leverage, and Conviction, filtering out popularity bias using Lift thresholds.
4. **Actionable Commercial Categorization:** Classifies rules into complementary vs colorway variants, tagging actionable rules with plain-language business explanations.
5. **Interactive Recommender & Cart Simulator:** Contextual on-page recommendations and multi-item basket recommendations with real-time antecedent explanation triggers.
6. **Chronological Offline Evaluation:** Evaluates generalisability using an 80/20 train/test time split (leave-one-out validation) compared against a storewide popularity baseline.
7. **Zero Fabricated Numbers:** Strictly adheres to scientific honesty; every metric, chart, and table in the UI is computed directly from actual pipeline run artifacts.

---

## 📋 CA2 Requirements Traceability Matrix

| Rubric Requirement | How & Where Met | Code / Artifact Location |
|---|---|---|
| **1. Relevant dataset & preprocessing** | UCI Online Retail (541,909 records); 11-step logged cleaning pipeline; UK scope filter; single-item basket filter. | [`preprocessing.py`](file:///d:/DMBI%20CA/backend/app/services/preprocessing.py), Preprocessing UI Page |
| **2. Implement data mining algorithm(s)** | Implemented **both FP-Growth and Apriori** with `mlxtend`; verified identical itemsets. | [`mining.py`](file:///d:/DMBI%20CA/backend/app/services/mining.py), [`benchmark.py`](file:///d:/DMBI%20CA/backend/app/services/benchmark.py), Comparison UI Page |
| **3. Generate and evaluate results** | Evaluated via Support, Confidence, Lift, Leverage, Conviction; 3-point sensitivity grid (0.5%, 1%, 2%). | [`mining.py`](file:///d:/DMBI%20CA/backend/app/services/mining.py), Explorer & Sensitivity UI Pages |
| **4. Appropriate visualizations** | All 4 CA1 visualisations included (Top products, Top rules by lift, Support vs Confidence scatter, Runtime comparison) + Network topology graph. | Visualisations UI Page, [`export_figures.py`](file:///d:/DMBI%20CA/backend/scripts/export_figures.py) |
| **5. Interpret results and explain insights** | Plain-language translation of top rules; clustering into botanical, storage, and party themes; popularity vs genuine association. | [`docs/INSIGHTS.md`](file:///d:/DMBI%20CA/docs/INSIGHTS.md), Insights UI Page |
| **6. Demonstrate business goal** | Single-product and cart recommender with explanations; offline 80/20 train/test evaluation vs popularity baseline; CA1 §9.8 Rule-to-Decision matrix. | [`recommender.py`](file:///d:/DMBI%20CA/backend/app/services/recommender.py), Recommender & Evaluation UI Pages |

---

## 🛠️ Technology Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, mlxtend, PyArrow (Parquet cache), Matplotlib, Pydantic v2, Pytest.
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, TanStack Query v5, Lucide React, React Router v7.
- **Storage:** Lightweight Parquet caches (`backend/data/processed/`) and JSON result indices (`backend/results/`).

---

## 💻 Installation & Quickstart

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Dataset Setup
The dataset `Online Retail.xlsx` (22.6 MB) is automatically acquired by running:
```bash
python backend/scripts/download_dataset.py
```
*(Or manually place `Online Retail.xlsx` from [UCI ML Repository](https://archive.ics.uci.edu/dataset/352/online+retail) into `backend/data/raw/`).*

### 2. Backend Setup & Pipeline Execution
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the master end-to-end data mining pipeline
python scripts/run_pipeline.py

# Export high-resolution report figures (200 DPI PNGs) and CSV tables
python scripts/export_figures.py

# Launch FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive Swagger documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup & Launch
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**.

---

## 🧪 Automated Testing & Sanity Checks

Run automated unit and integration test suites:
```bash
pytest backend/tests -v
```

### Verified Test Cases:
- `test_mini_example_frequent_itemsets`: Validates CA1 Section 7.2 worked mini-example frequent itemsets (A, B, C, {A,B}, {A,C}, {B,C}, {A,B,C}) at 40% support.
- `test_mini_example_rules`: Asserts mathematical parity for Rule $A \rightarrow C$ (Support 60%, Confidence 75%, Lift 0.94) and Rule $B \rightarrow C$ (Support 60%, Confidence 100%, Lift 1.25).
- `test_preprocessing`: Validates cancellation prefix removal ('C'), non-positive quantity and unit price filtering, non-product code regex exclusions, and UK market scope filtering.
- `test_recommender`: Asserts single-product and multi-item cart recommendations with fallback handling.
- `test_api`: Asserts FastAPI endpoints, schemas, and parameter guardrails.

---

## 📊 Discovered Key Findings Summary

- **Total Transactions Analyzed:** 16,506 multi-item UK baskets containing 1,628 unique products.
- **Average Basket Size:** 28.61 items per transaction.
- **Top Product:** `WHITE HANGING HEART T-LIGHT HOLDER` present in 12.64% of UK baskets.
- **Mined Association Rules:** 1,865 rules discovered at default Support ≥ 1.0% and Confidence ≥ 50.0%.
- **Maximum Lift Observed:** 75.03x (Herb Marker collection co-purchases).
- **Offline Evaluation (Time-Based Split):**
  - **Top-1 Hit Rate:** Rule Recommender = 4.63% vs Popularity Baseline = 0.55% (+4.08%)
  - **Top-3 Hit Rate:** Rule Recommender = 7.15% vs Popularity Baseline = 1.30% (+5.85%)
  - **Top-5 Hit Rate:** Rule Recommender = 8.03% vs Popularity Baseline = 1.91% (+6.12%)
  - **Catalog Coverage:** 65.48% on unseen future transactions.

---

## 📑 Repository Structure

```
DMBI-CA/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & CORS
│   │   ├── config.py            # Central paths, hyperparameters, guardrails
│   │   ├── schemas.py           # Pydantic v2 typed REST schemas
│   │   ├── routers/             # Modular REST routers (data, mining, compare, etc.)
│   │   └── services/            # Preprocessing, EDA, mining, benchmark, recommender
│   ├── scripts/
│   │   ├── download_dataset.py  # Dataset acquisition helper
│   │   ├── run_pipeline.py      # Master offline pipeline execution script
│   │   ├── export_figures.py    # 200 DPI PNG figures & CSV export script
│   │   └── generate_insights.py # Insights compiler
│   ├── data/
│   │   ├── raw/                 # Online Retail.xlsx (git-ignored)
│   │   └── processed/           # Cached parquets (raw, baskets, basket_matrix)
│   ├── results/                 # JSON outputs, figures/, rules_default.json
│   └── tests/                   # Pytest test suites (mini-example, preprocessing, API)
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # Typed backend API client
│   │   ├── components/          # Navbar, StatCard, ProcessFlow, RuleTable
│   │   ├── pages/               # 11 interactive dashboard pages
│   │   └── types/               # TypeScript interfaces matching Pydantic schemas
│   └── vite.config.ts           # Vite + Tailwind v4 + API proxy configuration
├── docs/
│   ├── DECISIONS.md             # Documented architectural choices & heuristics
│   ├── METHODOLOGY.md           # CA1 mapping, formulas, & technical specifications
│   └── INSIGHTS.md              # Auto-compiled executive report from live data
├── notebooks/
│   └── ca2_analysis.ipynb       # Reproducible end-to-end Jupyter notebook
└── task.md                      # Master task execution roadmap and checklist
```

---

## ⚖️ License & Academic Integrity
Developed solely for academic purposes for the DMBI Continuous Assessment (CA2) course at V.E.S.I.T. Autonomous Institute.
All data mining figures and calculations are reproducible from the original UCI dataset.

