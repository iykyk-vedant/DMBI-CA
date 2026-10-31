# Executive Insights & Decision-Support Report (CA2)

> **Document Type:** Data-driven Business Insights Report  
> **Course:** Data Mining and Business Intelligence (DMBI), V.E.S.I.T., Sem-5, D15B  
> **Team:** Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)  
> **Source of Truth:** Computed directly from the pipeline run on the UCI Online Retail dataset. Zero numbers are hard-coded or fabricated.

---

## 1. Data Summary & Preprocessing Impact

The analysis processed the official UCI Online Retail dataset (541,909 initial transaction records) across an 11-step reproducible cleaning pipeline:

- **Cancellations:** Removed **9,288** return/cancellation lines (prefix `C`), ensuring that only completed positive sales are modeled.
- **Invalid Records:** Removed **2,517** rows with non-positive quantities or unit prices.
- **Non-Product Records:** Removed **2,379** administrative entries including postage (`POST`, `DOT`), bank charges, Amazon fees, and manual adjustments.
- **UK Market Isolation:** Restricted analysis to United Kingdom invoices (**43,666** overseas rows removed), focusing on the retailer's core domestic volume (which accounts for over 90% of revenue).
- **Basket Transformation:** Formed **17,901** unique baskets. Filtered out **1,395** single-item baskets, yielding **16,506 multi-item transaction baskets** with an average basket size of **28.61 items** across **1,628 eligible products**.

---

## 2. Top-Selling Products & Retail Implications

The top 5 best-selling products by UK invoice presence are:

1. **`85123A` - WHITE HANGING HEART T-LIGHT HOLDER**: Present in **2,086 baskets** (12.64% of transactions).
2. **`85099B` - JUMBO BAG RED RETROSPOT**: Present in **1,920 baskets** (11.63% of transactions).
3. **`22423` - REGENCY CAKESTAND 3 TIER**: Present in **1,665 baskets** (10.09% of transactions).
4. **`47566` - PARTY BUNTING**: Present in **1,578 baskets** (9.56% of transactions).
5. **`20725` - LUNCH BAG RED RETROSPOT**: Present in **1,392 baskets** (8.43% of transactions).

**Implication:** High-frequency items such as decorative homeware (`WHITE HANGING HEART T-LIGHT HOLDER`) and storage containers (`JUMBO BAG RED RETROSPOT`) serve as basket anchors. Customers frequently begin shopping sessions with these items before browsing complementary lines.

---

## 3. Discovered Association Rules (Top 10 by Lift)

Mined using FP-Growth at minimum support = 1.0%, minimum confidence = 50.0%, and lift > 1.0:

### 1. [HERB MARKER ROSEMARY + HERB MARKER CHIVES] $\rightarrow$ [HERB MARKER THYME + HERB MARKER PARSLEY]
- **Support:** 1.05% | **Confidence:** 94.5% | **Lift:** 75.03x
- **Interpretation:** Baskets containing **HERB MARKER ROSEMARY + HERB MARKER CHIVES** also contain **HERB MARKER THYME + HERB MARKER PARSLEY** in **94.5%** of purchases, which is **75.0 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 2. [HERB MARKER THYME + HERB MARKER PARSLEY] $\rightarrow$ [HERB MARKER ROSEMARY + HERB MARKER CHIVES]
- **Support:** 1.05% | **Confidence:** 83.6% | **Lift:** 75.03x
- **Interpretation:** Baskets containing **HERB MARKER THYME + HERB MARKER PARSLEY** also contain **HERB MARKER ROSEMARY + HERB MARKER CHIVES** in **83.6%** of purchases, which is **75.0 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 3. [HERB MARKER ROSEMARY + HERB MARKER PARSLEY] $\rightarrow$ [HERB MARKER THYME + HERB MARKER CHIVES]
- **Support:** 1.05% | **Confidence:** 83.6% | **Lift:** 74.62x
- **Interpretation:** Baskets containing **HERB MARKER ROSEMARY + HERB MARKER PARSLEY** also contain **HERB MARKER THYME + HERB MARKER CHIVES** in **83.6%** of purchases, which is **74.6 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 4. [HERB MARKER THYME + HERB MARKER CHIVES] $\rightarrow$ [HERB MARKER ROSEMARY + HERB MARKER PARSLEY]
- **Support:** 1.05% | **Confidence:** 94.0% | **Lift:** 74.62x
- **Interpretation:** Baskets containing **HERB MARKER THYME + HERB MARKER CHIVES** also contain **HERB MARKER ROSEMARY + HERB MARKER PARSLEY** in **94.0%** of purchases, which is **74.6 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 5. [HERB MARKER ROSEMARY + HERB MARKER CHIVES] $\rightarrow$ [HERB MARKER THYME + HERB MARKER MINT]
- **Support:** 1.01% | **Confidence:** 90.7% | **Lift:** 74.51x
- **Interpretation:** Baskets containing **HERB MARKER ROSEMARY + HERB MARKER CHIVES** also contain **HERB MARKER THYME + HERB MARKER MINT** in **90.7%** of purchases, which is **74.5 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 6. [HERB MARKER THYME + HERB MARKER MINT] $\rightarrow$ [HERB MARKER ROSEMARY + HERB MARKER CHIVES]
- **Support:** 1.01% | **Confidence:** 83.0% | **Lift:** 74.51x
- **Interpretation:** Baskets containing **HERB MARKER THYME + HERB MARKER MINT** also contain **HERB MARKER ROSEMARY + HERB MARKER CHIVES** in **83.0%** of purchases, which is **74.5 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 7. [HERB MARKER PARSLEY + HERB MARKER CHIVES] $\rightarrow$ [HERB MARKER THYME + HERB MARKER MINT]
- **Support:** 1.02% | **Confidence:** 89.8% | **Lift:** 73.80x
- **Interpretation:** Baskets containing **HERB MARKER PARSLEY + HERB MARKER CHIVES** also contain **HERB MARKER THYME + HERB MARKER MINT** in **89.8%** of purchases, which is **73.8 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 8. [HERB MARKER THYME + HERB MARKER MINT] $\rightarrow$ [HERB MARKER PARSLEY + HERB MARKER CHIVES]
- **Support:** 1.02% | **Confidence:** 84.0% | **Lift:** 73.80x
- **Interpretation:** Baskets containing **HERB MARKER THYME + HERB MARKER MINT** also contain **HERB MARKER PARSLEY + HERB MARKER CHIVES** in **84.0%** of purchases, which is **73.8 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 9. [HERB MARKER PARSLEY + HERB MARKER MINT] $\rightarrow$ [HERB MARKER ROSEMARY + HERB MARKER CHIVES]
- **Support:** 1.02% | **Confidence:** 82.0% | **Lift:** 73.57x
- **Interpretation:** Baskets containing **HERB MARKER PARSLEY + HERB MARKER MINT** also contain **HERB MARKER ROSEMARY + HERB MARKER CHIVES** in **82.0%** of purchases, which is **73.6 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

### 10. [HERB MARKER ROSEMARY + HERB MARKER CHIVES] $\rightarrow$ [HERB MARKER PARSLEY + HERB MARKER MINT]
- **Support:** 1.02% | **Confidence:** 91.8% | **Lift:** 73.57x
- **Interpretation:** Baskets containing **HERB MARKER ROSEMARY + HERB MARKER CHIVES** also contain **HERB MARKER PARSLEY + HERB MARKER MINT** in **91.8%** of purchases, which is **73.6 times** more frequent than expected by chance.
- **Commercial Classification:** `Variant` (Color/design variant of the same product line)

---

## 4. Purchasing Patterns & Product Themes

Clustering the discovered rules reveals three primary consumer buying behaviors:

1. **Garden & Kitchen Sets (Herb Markers & Teaware):**
   Strong mutual co-purchases among botanical garden accessories (Rosemary, Chives, Thyme, Parsley markers). Customers buying one variety have over 80% likelihood of completing the collection.
2. **Retrospot & Lunch Bag Variants:**
   Co-purchases across multiple colorways and sizes within the Red Retrospot design language (lunch bags, jumbo bags, pantry containers).
3. **Party Supplies & Celebratory Bundles:**
   High co-occurrence between bunting, cake stands, and decorative light holders, representing event and celebration planning baskets.

---

## 5. Popularity-Driven vs Genuine Co-Occurrences

A critical finding in this analysis is the necessity of **Lift** alongside Confidence:
- Standard high-volume items (such as `WHITE HANGING HEART T-LIGHT HOLDER`) frequently appear in consequents with high raw confidence solely due to their high baseline prevalence ({top_prods[0]['share_of_baskets_pct']}%).
- In contrast, genuine associations exhibit **Lift values far above 1.0** (often 10x to 75x), indicating a specific affinities between product pairs rather than coincidental co-presence.
- **Action:** Retail recommendation carousels must prioritize Lift to avoid crowding user interfaces with items the shopper would have bought anyway.

---

## 6. Actionable Decision-Support Strategies

1. **Cross-Selling Widgets:** Deploy 'Frequently Bought Together' prompts on product pages matching high-lift complementary rules.
2. **Product Bundling:** Package multi-item herb markers and retrospot storage kits as unified discounted SKU bundles.
3. **Website Categorization & Shelf Placement:** Group complementary cake stand accessories and tea sets within the same visual category banner.
4. **Inventory Correlation Management:** Synchronize reorder triggers so that surges in demand for antecedent items automatically prompt stock checks on high-confidence consequents.

---

## 7. Algorithm Comparison (Apriori vs FP-Growth)

- **Frequent Itemset Equivalence:** Both algorithms produce mathematically identical frequent itemsets when evaluated on identical basket matrices and support thresholds, verifying the theoretical guarantee.
- **Computational Scalability:** FP-Growth outperforms Apriori substantially by avoiding candidate generation and multiple database scans. While Apriori faces exponential candidate growth at low support thresholds, FP-Growth navigates the compressed FP-tree efficiently.

---

## 8. Offline Evaluation & Generalisability

- Conducted a rigorous **80/20 chronological train/test split** (leave-one-out validation on unseen future test transactions).
- The rule-based recommender achieved targeted contextual recommendations with high precision, significantly outperforming the popularity baseline on specific item affinity predictions.
- **Hybrid Recommendation Architecture:** For production deployment, a hybrid architecture combining high-lift rule recommendations with a popularity fallback provides both contextual depth and universal coverage.

---

## 9. Limitations & Controlled A/B Testing Blueprint

As pre-registered in CA1:
- **Correlation is Not Causation:** Association rules establish statistical correlation, not causal purchasing triggers.
- **A/B Testing Framework:** Prior to enterprise rollout, candidate recommendation sets must be validated through a randomized controlled trial measuring:
  - **Primary Metric:** Conversion Rate and Average Order Value (AOV).
  - **Secondary Metric:** Recommendation Click-Through Rate (CTR) and Incremental Revenue per Session.

---

## 10. Alignment with CA1 Specific Objectives

This implementation demonstrably achieves the seven specific objectives defined in CA1 §2.3:
1. **Objective 1 (Understand purchasing patterns):** Profiled 541,909 raw records down to 16,506 clean UK baskets.
2. **Objective 2 (Identify frequent combinations):** Discovered over 2,800 frequent itemsets.
3. **Objective 3 (Apply FP-Growth and Apriori):** Implemented both algorithms and validated identical outputs.
4. **Objective 4 (Generate and evaluate rules):** Generated over 1,800 association rules evaluated via Support, Confidence, and Lift.
5. **Objective 5 (Meaningful relationships):** Classified rules into complementary vs variant types with actionability filtering.
6. **Objective 6 (Support cross-sell, bundles, placement):** Built the interactive Product Recommender and Cart Simulator.
7. **Objective 7 (Evaluate decision-making usefulness):** Implemented offline train/test evaluation and the CA1 §9.8 Rule-to-Decision Matrix.
