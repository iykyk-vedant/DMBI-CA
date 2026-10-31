# Architectural & Methodological Decisions Log (CA2)

> **Document Purpose:** Every architectural choice, heuristic definition, and parameter decision made during implementation, matching the requirement in `ANTIGRAVITY_SPEC.md` Section 0 & Section 1.

---

## Decision 1: Association Support Denominator
- **Choice:** Multi-item baskets ($\ge 2$ items), $N = 16,506$ baskets.
- **Alternatives Considered:** All valid UK baskets ($N = 17,901$, including 1-item baskets).
- **Reasoning:** A single-item basket can never contain an association pair or co-purchase. Including single-item baskets artificially deflates support values and skews confidence metrics for cross-selling and bundling recommendations. As pre-registered in CA1 Section 4.6 and Section 4.7, we filter single-item baskets for association rule mining and document the denominator count explicitly in `final_counts.json`.

---

## Decision 2: Maximum Itemset Length (`max_len = 4`)
- **Choice:** Capped at `max_len = 4` for frequent itemset generation in both algorithms.
- **Alternatives Considered:** Unconstrained itemset length (`max_len = None`).
- **Reasoning:** For retail cross-selling and promotional bundling, associations larger than 4 items (e.g. 5-item, 6-item combinations) are rarely actionable or digestible by shoppers. Furthermore, unconstrained candidate generation causes Apriori to exhaust memory at lower support thresholds. Setting `max_len = 4` identically for both Apriori and FP-Growth guarantees a fair computational comparison.

---

## Decision 3: Variant-Product Detection Heuristic
- **Choice:** Lexical token analysis on product descriptions.
- **Heuristic:**
  1. Strip standard color and size modifiers (`RED`, `BLUE`, `PINK`, `GREEN`, `WHITE`, `BLACK`, `SMALL`, `LARGE`, `MEDIUM`, `MINI`, `SET/3`, etc.).
  2. If the antecedent and consequent share the first two significant base words or share $\ge 60\%$ of significant words, the rule is classified as `rule_type: "variant"`.
  3. Otherwise, it is classified as `rule_type: "complementary"`.
- **Reasoning:** Wholesalers frequently purchase multiple colorways of the same product (e.g. `JUMBO BAG RED RETROSPOT` and `JUMBO BAG PINK RETROSPOT`). While these associations are real, distinguishing them from genuine cross-category complements (e.g. `CAKESTAND` and `TEA TOWEL`) provides far greater business utility to retail merchandisers.

---

## Decision 4: Cart Multi-Item Score Aggregation
- **Choice:** Maximum Lift with tie-breaking on Confidence.
- **Alternatives Considered:** Sum of confidences; Average lift.
- **Reasoning:** If a shopping cart contains multiple items, a suggested product may be triggered by several distinct rules. Taking the maximum Lift score highlights the single strongest commercial affinity, while avoiding score inflation for generic items triggered weakly by multiple cart products.

---

## Decision 5: Recommendation Fallback Policy
- **Choice:** Explicit empty state when no rule applies, with an optional, clearly labeled "Popularity Fallback".
- **Reasoning:** CA1 emphasized that associations must be backed by historical evidence. The recommender never returns ungrounded random suggestions. If no rules trigger, the customer is told why, and top-selling storewide items are presented strictly as a fallback.

---

## Decision 6: Safety Guardrails for Interactive Mining
- **Choice:** Floor `min_support >= 0.005` (0.5%) and `timeout = 120s`.
- **Reasoning:** Interactive web users can drag sliders to arbitrary thresholds. Setting a hard floor at 0.5% and a 120s timeout in FastAPI prevents runaway processes from exhausting server memory while allowing full exploration of CA1's pre-registered sensitivity grid.

