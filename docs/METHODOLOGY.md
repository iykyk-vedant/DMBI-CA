# Data Mining Methodology & Technical Specification (CA2)

> **Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B  
> **Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)  
> **Faculty Guide:** Sukanya Roychowdhury  
> **Alignment:** Directly maps to CA1 Sections 1 through 13 and `ANTIGRAVITY_SPEC.md`.

---

## 1. Introduction
Market Basket Analysis (MBA) is an unsupervised descriptive data mining technique designed to uncover co-occurrence relationships among products purchased within the same customer shopping transaction. This implementation applies MBA to real-world transactional data from an online retailer selling unique all-occasion giftware, evaluating the FP-Growth and Apriori algorithms to generate evidence-based product recommendations and cross-selling shortlists.

Pipeline lifecycle:
$$\text{Problem} \longrightarrow \text{Data} \longrightarrow \text{Preprocessing} \longrightarrow \text{Algorithm} \longrightarrow \text{Results} \longrightarrow \text{Evaluation} \longrightarrow \text{Insights} \longrightarrow \text{Decision}$$

---

## 2. Problem Statement & Business Objectives
- **Problem Statement:** How can historical retail transactions be analysed to discover which products are frequently purchased together, so that the retailer can generate data-driven product recommendations and cross-selling strategies?
- **Business Objective:** Identify reliable product associations to shortlist complementary-product recommendations and cross-selling opportunities for testing. (Does not prove causation or guaranteed revenue increase without a controlled post-deployment A/B test).

---

## 3. Dataset Understanding
- **Source:** UCI Machine Learning Repository – Online Retail Dataset (Dataset ID 352).
- **Temporal Span:** 1 December 2010 to 9 December 2011.
- **Attributes:** `InvoiceNo`, `StockCode`, `Description`, `Quantity`, `InvoiceDate`, `UnitPrice`, `CustomerID`, `Country`.

---

## 4. 11-Step Preprocessing Pipeline
1. **Load and Inspect:** Load raw transaction lines, verify field types and null distributions.
2. **Handle Missing Values:** Drop missing `InvoiceNo` or `StockCode`. Retain missing `CustomerID` (invoice-level mining does not require customer identity). Impute missing `Description` using canonical mode label per `StockCode`.
3. **Cancellation Filter:** Exclude completed return invoices identified by prefix `'C'`.
4. **Invalid Lines Filter:** Exclude rows with `Quantity <= 0` or `UnitPrice <= 0`.
5. **Non-Product Records Filter:** Exclude non-merchandise codes (`POST`, `DOT`, `M`, `BANK CHARGES`, `AMAZONFEE`, `CRUK`, `C2`, `S`, `B`, `D`, `PADS`, vouchers) and invalid code patterns.
6. **Exact Duplicates Filter:** Remove duplicated transaction rows.
7. **Text Standardization:** Normalize whitespace, uppercase text, build canonical `StockCode -> label` map.
8. **Target Market Scope:** Restrict to United Kingdom transactions (home market representing >90% volume).
9. **Transaction Grouping:** Group records by `InvoiceNo` into distinct sets of `StockCode`s.
10. **Basket Size Filter:** Exclude single-item baskets (basket size $\ge 2$) for association mining.
11. **One-Hot Encoding:** Filter items below 0.5% support floor to optimize memory and build a boolean basket matrix.

---

## 5. Identification of Data Mining Task
Association Rule Mining is selected as an unsupervised descriptive task. Unlike supervised classification or regression, it requires no pre-labeled target variable and extracts co-purchase rules of the form $X \rightarrow Y$ directly from transaction records.

---

## 6. Mining Algorithms & Justification
- **FP-Growth (Primary):** Compresses transactions into an FP-tree and mines frequent patterns recursively without candidate generation. Requires only two scans of the database and scales efficiently to lower support thresholds.
- **Apriori (Comparative Benchmark):** Classic level-wise algorithm based on the Apriori property (all non-empty subsets of a frequent itemset must be frequent). Serves as an academic baseline.

---

## 7. Worked Mini-Example Verification
Verified against the 5-transaction hypothetical dataset from CA1 §7.2:
- $T_1$: {A, B, C}, $T_2$: {A, C}, $T_3$: {A, D}, $T_4$: {B, C, E}, $T_5$: {A, B, C}.
- At $\text{min\_support} = 40\%$: Frequent itemsets are A(4), B(3), C(4), {A,B}(2), {A,C}(3), {B,C}(3), {A,B,C}(2).
- Rule $A \rightarrow C$: Support = 60%, Confidence = 75%, $\text{Lift} = 0.75 / 0.80 = 0.9375$ (~0.94).
- Rule $B \rightarrow C$: Support = 60%, Confidence = 100%, $\text{Lift} = 1.00 / 0.80 = 1.25$.

---

## 8. Evaluation Measures
- **Support:** $\text{Support}(X \rightarrow Y) = \frac{\text{Count}(X \cup Y)}{N}$
- **Confidence:** $\text{Confidence}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$
- **Lift:** $\text{Lift}(X \rightarrow Y) = \frac{\text{Confidence}(X \rightarrow Y)}{\text{Support}(Y)}$
  - $\text{Lift} > 1$: Positive association.
  - $\text{Lift} = 1$: Independence.
  - $\text{Lift} < 1$: Negative association.
- **Leverage:** $\text{Support}(X \cup Y) - (\text{Support}(X) \times \text{Support}(Y))$
- **Conviction:** $\frac{1 - \text{Support}(Y)}{1 - \text{Confidence}(X \rightarrow Y)}$

---

## 9. Business Insights & Decision Support
Discovered rules drive four commercial interventions:
1. **Product Recommendations:** On-page suggestions ("Frequently Bought Together").
2. **Cross-Selling:** Real-time cart add-on recommendations.
3. **Product Bundling:** Pre-packaged themed gift sets.
4. **Website Category Placement:** Co-locating complementary items in digital aisles.

---

## 10. Complete Process Flow Table

| Stage | Activity | Artifact / Output |
|---|---|---|
| Problem | Define recommendation and cross-selling goals | Business objective & boundaries |
| Data | UCI Online Retail (541,909 records) | Raw dataset |
| Preprocessing | 11-step cleaning, UK scope, basket encoding | `raw_profile.json`, `baskets.parquet`, `preprocessing_log.json` |
| Algorithm | FP-Growth (primary) & Apriori (comparison) | Frequent itemsets |
| Results | Association rule generation ($X \rightarrow Y$) | `rules_default.json` |
| Evaluation | Metric computation (Support, Confidence, Lift) | Sensitivity & benchmark tables |
| Insights | Plain-language interpretation & themes | `docs/INSIGHTS.md` |
| Decision | Recommender, cart simulator, decision matrix | Interactive web app & A/B testing plan |

---

## 11. Advantages & Limitations
### Advantages
- Completely unsupervised; extracts patterns directly from actual customer transaction logs.
- Interpretable IF-THEN rules understandable to commercial stakeholders.
- Multi-metric evaluation (Lift overcomes raw confidence bias on popular items).

### Limitations
- Statistical association does not prove causation.
- Subject to wholesaler purchasing patterns inherent in the UK giftware retailer dataset.
- Seasonal purchasing fluctuations require periodic model refreshing.

---

## 12. Conclusion & Controlled A/B Testing Blueprint
Association rule mining successfully shortlists high-affinity product pairs. To establish causal revenue impact, recommendations must be tested through a randomized A/B trial:
- **Treatment Group:** Shoppers presented with rule-based recommendation carousels.
- **Control Group:** Shoppers presented with unguided browsing or popularity-based fallbacks.
- **Key Outcome Metrics:** Conversion Rate (%), Average Order Value (AOV), and Revenue per User (RPU).

---

## 13. Academic References
1. Chen, D. (2015). Online Retail [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5BW33
2. Agrawal, R., Imieliński, T., and Swami, A. (1993). Mining Association Rules Between Sets of Items in Large Databases. ACM SIGMOD.
3. Agrawal, R., and Srikant, R. (1994). Fast Algorithms for Mining Association Rules. VLDB.
4. Han, J., Pei, J., and Yin, Y. (2000). Mining Frequent Patterns without Candidate Generation. ACM SIGMOD.
5. Han, J., Kamber, M., and Pei, J. (2011). Data Mining: Concepts and Techniques (3rd ed.). Morgan Kaufmann.
6. mlxtend Documentation. Association Rules. https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/association_rules/

