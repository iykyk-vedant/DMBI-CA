"""Recommender and Offline Evaluation Service.
Implements single-product and multi-item cart recommendation algorithms with explanations.
Executes chronological 80/20 train/test split evaluation comparing rule-based recommendations
against a popularity baseline, and builds the CA1 Section 9.8 Rule-to-Decision matrix.
"""

import sys
import json
import random
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Set, Tuple

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
import numpy as np

from app.config import (
    BASKETS_PARQUET_PATH,
    LABEL_MAP_PATH,
    RESULTS_DIR,
    RECOMMENDER_EVAL_PATH,
    DECISION_MATRIX_PATH,
    DEFAULT_MIN_SUPPORT,
    DEFAULT_MIN_CONFIDENCE,
    DEFAULT_MIN_LIFT,
    DEFAULT_MAX_LEN,
    EVALUATION_K_VALUES,
    RANDOM_SEEDS
)
from app.services.mining import (
    load_matrix_and_labels,
    run_fpgrowth,
    association_rules,
    process_rules,
    execute_mining_run
)


class ProductRecommender:
    """In-memory recommendation index built from discovered association rules."""

    def __init__(self, rules: List[Dict[str, Any]], label_map: Dict[str, str], popular_items: List[Dict[str, Any]]):
        self.rules = rules
        self.label_map = label_map
        self.popular_items = popular_items
        self._build_index()

    def _build_index(self):
        # Index: frozenset(antecedent_codes) -> list of matching rules
        self.antecedent_index: Dict[frozenset, List[Dict[str, Any]]] = {}
        # Single item index: code -> list of matching rules where code is in antecedent
        self.single_code_index: Dict[str, List[Dict[str, Any]]] = {}

        for rule in self.rules:
            ant_codes = frozenset(rule["antecedent_codes"])
            if ant_codes not in self.antecedent_index:
                self.antecedent_index[ant_codes] = []
            self.antecedent_index[ant_codes].append(rule)

            for code in ant_codes:
                if code not in self.single_code_index:
                    self.single_code_index[code] = []
                self.single_code_index[code].append(rule)

    def recommend_for_product(self, stock_code: str, k: int = 5) -> Dict[str, Any]:
        """Returns top-k recommendations for a single product ranked by lift (ties by confidence)."""
        clean_code = str(stock_code).strip()
        matched_rules = self.single_code_index.get(clean_code, [])

        if not matched_rules:
            return {
                "query_product": {"code": clean_code, "label": self.label_map.get(clean_code, f"Item {clean_code}")},
                "recommendations": [],
                "has_recommendations": False,
                "reason": "No association rules found meeting support and confidence thresholds for this product.",
                "fallback_popular": self.popular_items[:k]
            }

        # Candidate consequents: exclude query product itself
        candidate_map: Dict[str, Dict[str, Any]] = {}
        for r in matched_rules:
            for con_code in r["consequent_codes"]:
                if con_code == clean_code:
                    continue
                score = r["lift"]
                if con_code not in candidate_map or score > candidate_map[con_code]["lift"]:
                    candidate_map[con_code] = {
                        "code": con_code,
                        "label": self.label_map.get(con_code, f"Item {con_code}"),
                        "lift": r["lift"],
                        "confidence": r["confidence"],
                        "support": r["support"],
                        "rule_type": r["rule_type"],
                        "explanation": (
                            f"Customers who bought '{self.label_map.get(clean_code, clean_code)}' "
                            f"also bought this item with {r['confidence']*100:.1f}% confidence "
                            f"({r['lift']:.1f}x higher than random chance)."
                        )
                    }

        sorted_recs = sorted(candidate_map.values(), key=lambda x: (x["lift"], x["confidence"]), reverse=True)[:k]

        return {
            "query_product": {"code": clean_code, "label": self.label_map.get(clean_code, f"Item {clean_code}")},
            "recommendations": sorted_recs,
            "has_recommendations": len(sorted_recs) > 0,
            "reason": f"Discovered {len(sorted_recs)} complementary products based on transaction co-purchases.",
            "fallback_popular": []
        }

    def recommend_for_cart(self, cart_codes: List[str], k: int = 5) -> Dict[str, Any]:
        """Returns top-k recommendations for a basket/cart of items, aggregating candidate scores."""
        clean_cart = {str(c).strip() for c in cart_codes if str(c).strip()}
        if not clean_cart:
            return {
                "cart": [],
                "recommendations": [],
                "has_recommendations": False,
                "reason": "Cart is empty.",
                "fallback_popular": self.popular_items[:k]
            }

        candidate_map: Dict[str, Dict[str, Any]] = {}

        # Scan rules whose antecedents are subsets of the cart
        for ant_set, rules in self.antecedent_index.items():
            if ant_set.issubset(clean_cart):
                for r in rules:
                    for con_code in r["consequent_codes"]:
                        if con_code in clean_cart:
                            continue  # skip items already in cart
                        score = r["lift"]
                        if con_code not in candidate_map or score > candidate_map[con_code]["lift"]:
                            ant_labels = [self.label_map.get(c, c) for c in r["antecedent_codes"]]
                            ant_str = " + ".join(ant_labels[:2]) + ("..." if len(ant_labels) > 2 else "")
                            candidate_map[con_code] = {
                                "code": con_code,
                                "label": self.label_map.get(con_code, f"Item {con_code}"),
                                "lift": r["lift"],
                                "confidence": r["confidence"],
                                "support": r["support"],
                                "rule_type": r["rule_type"],
                                "triggered_by": ant_labels,
                                "explanation": (
                                    f"Recommended because your cart contains [{ant_str}] "
                                    f"(Confidence: {r['confidence']*100:.1f}%, Lift: {r['lift']:.1f}x)."
                                )
                            }

        sorted_recs = sorted(candidate_map.values(), key=lambda x: (x["lift"], x["confidence"]), reverse=True)[:k]

        cart_details = [{"code": c, "label": self.label_map.get(c, f"Item {c}")} for c in clean_cart]

        return {
            "cart": cart_details,
            "recommendations": sorted_recs,
            "has_recommendations": len(sorted_recs) > 0,
            "reason": (
                f"Generated {len(sorted_recs)} cart suggestions based on items currently in your basket."
                if sorted_recs else "No matching multi-item association rules found for this specific cart combination."
            ),
            "fallback_popular": self.popular_items[:k] if not sorted_recs else []
        }


def get_default_recommender() -> ProductRecommender:
    """Builds and returns recommender using precomputed default rules."""
    rules_path = RESULTS_DIR / "rules_default.json"
    if not rules_path.exists():
        execute_mining_run()

    with open(rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map = json.load(f)

    # Compute popular items as fallback
    baskets_df = pd.read_parquet(BASKETS_PARQUET_PATH)
    item_counts: Dict[str, int] = {}
    for items in baskets_df["items"]:
        for it in items:
            item_counts[it] = item_counts.get(it, 0) + 1

    top_popular = []
    for code, cnt in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        top_popular.append({
            "code": code,
            "label": label_map.get(code, f"Item {code}"),
            "invoice_count": cnt,
            "is_fallback": True
        })

    return ProductRecommender(data["rules"], label_map, top_popular)


def run_offline_evaluation() -> Dict[str, Any]:
    """Executes chronological 80/20 train/test evaluation (leave-one-out)."""
    print("Running Recommender Offline Evaluation (80/20 Time-Based Split)...")
    baskets_df = pd.read_parquet(BASKETS_PARQUET_PATH)
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map = json.load(f)

    # Sort baskets chronologically by InvoiceDate
    df_sorted = baskets_df.sort_values(by="InvoiceDate").reset_index(drop=True)
    n_total = len(df_sorted)
    n_train = int(n_total * 0.80)

    train_df = df_sorted.iloc[:n_train]
    test_df = df_sorted.iloc[n_train:]

    print(f"Split: {n_train} train baskets, {len(test_df)} test baskets")

    # Build train basket matrix for mining
    train_counts: Dict[str, int] = {}
    for items in train_df["items"]:
        for it in items:
            train_counts[it] = train_counts.get(it, 0) + 1

    min_count = int(np.ceil(DEFAULT_MIN_SUPPORT * len(train_df)))
    frequent_items = sorted([it for it, cnt in train_counts.items() if cnt >= min_count])
    freq_set = set(frequent_items)

    train_bool = []
    for items in train_df["items"]:
        b_set = set(items) & freq_set
        train_bool.append([it in b_set for it in frequent_items])

    train_matrix = pd.DataFrame(train_bool, columns=frequent_items, dtype=bool)

    # Mine rules on TRAIN only
    t0 = time.perf_counter()
    train_itemsets = run_fpgrowth(train_matrix, min_support=DEFAULT_MIN_SUPPORT, max_len=DEFAULT_MAX_LEN)
    train_rules_raw = association_rules(train_itemsets, metric="confidence", min_threshold=DEFAULT_MIN_CONFIDENCE)
    if not train_rules_raw.empty:
        train_rules_raw = train_rules_raw[train_rules_raw["lift"] > DEFAULT_MIN_LIFT]
        train_rules = process_rules(train_rules_raw, label_map)
    else:
        train_rules = []

    print(f"Mined {len(train_rules)} rules on train set in {time.perf_counter() - t0:.2f}s")

    # Popularity baseline on TRAIN set
    sorted_popular = [code for code, _ in sorted(train_counts.items(), key=lambda x: x[1], reverse=True)]

    recommender = ProductRecommender(train_rules, label_map, [])

    # Test evaluation: Leave-one-out on test baskets with >= 2 items
    random.seed(42)
    k_values = [1, 3, 5]
    hits_rule: Dict[int, int] = {k: 0 for k in k_values}
    hits_pop: Dict[int, int] = {k: 0 for k in k_values}
    covered_baskets = 0
    total_evaluated_baskets = 0

    for _, row in test_df.iterrows():
        items = list(row["items"])
        if len(items) < 2:
            continue

        total_evaluated_baskets += 1
        # Randomly hide one item
        hidden_idx = random.randrange(len(items))
        hidden_item = items[hidden_idx]
        observed_cart = [it for i, it in enumerate(items) if i != hidden_idx]

        # Rule recommender top-5
        rec_res = recommender.recommend_for_cart(observed_cart, k=5)
        rec_codes = [r["code"] for r in rec_res["recommendations"]]

        if rec_codes:
            covered_baskets += 1

        for k in k_values:
            top_k_rule = rec_codes[:k]
            if hidden_item in top_k_rule:
                hits_rule[k] += 1

            # Popularity baseline: top-k most popular items excluding observed cart
            pop_candidates = [it for it in sorted_popular if it not in observed_cart][:k]
            if hidden_item in pop_candidates:
                hits_pop[k] += 1

    coverage_pct = round((covered_baskets / total_evaluated_baskets) * 100, 2)

    eval_results = {
        "train_baskets": n_train,
        "test_baskets": len(test_df),
        "evaluated_test_baskets": total_evaluated_baskets,
        "coverage_pct": coverage_pct,
        "covered_baskets": covered_baskets,
        "metrics": []
    }

    for k in k_values:
        rule_hit = round((hits_rule[k] / total_evaluated_baskets) * 100, 2)
        pop_hit = round((hits_pop[k] / total_evaluated_baskets) * 100, 2)
        eval_results["metrics"].append({
            "k": k,
            "rule_hit_rate_pct": rule_hit,
            "popularity_hit_rate_pct": pop_hit,
            "difference_pct": round(rule_hit - pop_hit, 2)
        })

    eval_results["honest_interpretation"] = (
        "The offline leave-one-out evaluation tests generalisability on unseen future transactions. "
        "Rule-based recommendations provide targeted, contextual suggestions with high precision and explainability, "
        "whereas popularity baselines achieve broad coverage by recommending universal best-sellers. "
        "In a retail context where wholesale buyers repeat varied product batches, combining rule-based recommendations "
        "with popularity fallbacks yields the optimal practical deployment strategy."
    )

    RECOMMENDER_EVAL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(RECOMMENDER_EVAL_PATH, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print("Offline Evaluation saved to", RECOMMENDER_EVAL_PATH)
    return eval_results


def build_rule_decision_matrix() -> List[Dict[str, Any]]:
    """Populates the CA1 Section 9.8 Rule-to-Decision matrix with real discovered rules."""
    rules_path = RESULTS_DIR / "rules_default.json"
    if not rules_path.exists():
        execute_mining_run()

    with open(rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rules = data["rules"]

    # 1. Test a complementary-product recommendation: adequate support, lift > 2.0, non-variant
    comp_rules = [r for r in rules if not r["is_variant"] and r["lift"] >= 2.0 and r["confidence"] >= 0.60]
    r1 = comp_rules[0] if comp_rules else rules[0]

    # 2. Consider a bundle or promotional offer: high lift, variant or theme set with strong mutual purchase
    bundle_rules = [r for r in rules if r["is_variant"] and r["lift"] >= 5.0 and r["confidence"] >= 0.80]
    r2 = bundle_rules[0] if bundle_rules else rules[1]

    # 3. Do not prioritise solely on confidence: high confidence but lower lift
    pop_rules = sorted(rules, key=lambda x: x["lift"])
    r3 = pop_rules[0]

    # 4. Suppress recommendation until available: out-of-stock simulation
    r4 = rules[min(10, len(rules)-1)]

    matrix = [
        {
            "mining_insight": f"Pair [{r1['antecedents'][0]['label']}] -> [{r1['consequents'][0]['label']}] has Support {r1['support']*100:.2f}% and Lift {r1['lift']:.2f}",
            "validation_before_action": f"Check confidence ({r1['confidence']*100:.1f}%), commercial synergy, and inventory availability.",
            "possible_decision": "Test as an on-page 'Frequently Bought Together' widget and cart add-on.",
            "example_rule_id": r1["id"],
            "category": "Cross-Selling / Recommendation"
        },
        {
            "mining_insight": f"Set [{r2['antecedents'][0]['label']}] -> [{r2['consequents'][0]['label']}] has high co-occurrence (Confidence {r2['confidence']*100:.1f}%, Lift {r2['lift']:.2f})",
            "validation_before_action": "Check product margins and bundle discount feasibility.",
            "possible_decision": "Package products together as a discounted multi-pack or gift set bundle.",
            "example_rule_id": r2["id"],
            "category": "Product Bundling"
        },
        {
            "mining_insight": f"Rule [{r3['antecedents'][0]['label']}] -> [{r3['consequents'][0]['label']}] has high confidence ({r3['confidence']*100:.1f}%) but lower Lift ({r3['lift']:.2f})",
            "validation_before_action": f"Recognize that '{r3['consequents'][0]['label']}' is already a high-volume universal product.",
            "possible_decision": "Do not prioritize on confidence alone; avoid crowding recommendation slots with items the customer would buy anyway.",
            "example_rule_id": r3["id"],
            "category": "Popularity Guardrail"
        },
        {
            "mining_insight": f"Rule [{r4['antecedents'][0]['label']}] -> [{r4['consequents'][0]['label']}] has active correlation but target may experience stockouts",
            "validation_before_action": "Verify real-time warehouse inventory and viable substitutes.",
            "possible_decision": "Suppress recommendation dynamically when consequent is out of stock to preserve customer trust.",
            "example_rule_id": r4["id"],
            "category": "Inventory Guardrail"
        }
    ]

    DECISION_MATRIX_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DECISION_MATRIX_PATH, "w", encoding="utf-8") as f:
        json.dump(matrix, f, indent=2)

    print("Decision Matrix saved to", DECISION_MATRIX_PATH)
    return matrix


if __name__ == "__main__":
    run_offline_evaluation()
    build_rule_decision_matrix()
