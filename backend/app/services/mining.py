"""Mining Service for Frequent Itemsets and Association Rules.
Implements FP-Growth, Apriori, rule evaluation, post-processing actionability heuristics,
and result caching.
"""

import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple, Set

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import fpgrowth, apriori, association_rules

from app.config import (
    BASKET_MATRIX_PARQUET_PATH,
    LABEL_MAP_PATH,
    RESULTS_DIR,
    DEFAULT_MIN_SUPPORT,
    DEFAULT_MIN_CONFIDENCE,
    DEFAULT_MIN_LIFT,
    DEFAULT_MAX_LEN,
    DEFAULT_ALGORITHM
)
from app.services.cache import compute_cache_key, get_cached_result, save_cached_result

COLOR_AND_STYLE_TOKENS = {
    "RED", "BLUE", "PINK", "GREEN", "WHITE", "BLACK", "YELLOW", "PURPLE",
    "ORANGE", "BROWN", "GREY", "GRAY", "SILVER", "GOLD", "SMALL", "LARGE",
    "MEDIUM", "MINI", "SET/3", "SET/4", "SET/6", "SET/2"
}


def load_matrix_and_labels() -> Tuple[pd.DataFrame, Dict[str, str]]:
    """Loads preprocessed boolean basket matrix and product label map."""
    if not BASKET_MATRIX_PARQUET_PATH.exists():
        raise FileNotFoundError(f"Basket matrix not found at {BASKET_MATRIX_PARQUET_PATH}. Run preprocessing first.")
    
    matrix = pd.read_parquet(BASKET_MATRIX_PARQUET_PATH)
    label_map = {}
    if LABEL_MAP_PATH.exists():
        with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
            label_map = json.load(f)
    return matrix, label_map


def run_fpgrowth(basket_matrix: pd.DataFrame, min_support: float, max_len: int = 4) -> pd.DataFrame:
    """Discovers frequent itemsets using FP-Growth."""
    return fpgrowth(basket_matrix, min_support=min_support, max_len=max_len, use_colnames=True)


def run_apriori(basket_matrix: pd.DataFrame, min_support: float, max_len: int = 4) -> pd.DataFrame:
    """Discovers frequent itemsets using Apriori."""
    return apriori(basket_matrix, min_support=min_support, max_len=max_len, use_colnames=True)


def is_variant_rule(ant_codes: List[str], con_codes: List[str], label_map: Dict[str, str]) -> bool:
    """Heuristic: checks if antecedent and consequent share product base names
    differing only by color or style variants (e.g. JUMBO BAG RED vs JUMBO BAG BLUE).
    """
    ant_labels = [label_map.get(c, "").upper() for c in ant_codes]
    con_labels = [label_map.get(c, "").upper() for c in con_codes]

    for a_lbl in ant_labels:
        a_words = [w for w in a_lbl.split() if w not in COLOR_AND_STYLE_TOKENS]
        for c_lbl in con_labels:
            c_words = [w for w in c_lbl.split() if w not in COLOR_AND_STYLE_TOKENS]
            # Check if they share at least 2 consecutive prefix words or 60%+ significant words
            if len(a_words) >= 2 and len(c_words) >= 2:
                if a_words[:2] == c_words[:2]:
                    return True
                shared = set(a_words) & set(c_words)
                if len(shared) >= 2 and (len(shared) / max(len(a_words), len(c_words)) >= 0.6):
                    return True
    return False


def process_rules(
    rules_df: pd.DataFrame,
    label_map: Dict[str, str]
) -> List[Dict[str, Any]]:
    """Converts raw association rules to enriched, post-processed serializable dictionaries
    with actionability flags and business tags.
    """
    if rules_df.empty:
        return []

    # Sort primarily by lift, then confidence
    sorted_df = rules_df.sort_values(by=["lift", "confidence"], ascending=[False, False]).copy()

    records = []
    # Set of (consequent_frozenset, item_code) for O(1) redundancy lookup
    simpler_antecedents: Set[Tuple[frozenset, str]] = set()

    for idx, row in sorted_df.iterrows():
        ant_set = row["antecedents"]
        con_set = row["consequents"]
        ant_list = sorted(list(ant_set))
        con_list = sorted(list(con_set))

        conf = float(row["confidence"])
        lift_val = float(row["lift"])
        supp = float(row["support"])
        ant_supp = float(row["antecedent support"])
        con_supp = float(row["consequent support"])
        leverage = float(row["leverage"]) if "leverage" in row else None
        
        # Conviction handling (inf -> None)
        conv = row["conviction"] if "conviction" in row else None
        conv_val = None if (conv is None or np.isinf(conv) or np.isnan(conv)) else float(conv)

        # Flag 1: Redundancy check
        # A multi-item antecedent is redundant if any of its individual items already associates with the consequent
        is_redundant = False
        if len(ant_set) > 1:
            for item in ant_set:
                if (con_set, item) in simpler_antecedents:
                    is_redundant = True
                    break
        elif len(ant_set) == 1:
            simpler_antecedents.add((con_set, next(iter(ant_set))))

        # Flag 2: Popularity-driven check
        # High confidence but lift near 1 (< 1.15) or consequent support very high (> 10%)
        is_popularity_driven = (lift_val < 1.15) or (con_supp >= 0.10 and lift_val < 1.30)

        # Flag 3: Variant-product check
        is_variant = is_variant_rule(ant_list, con_list, label_map)
        rule_type = "variant" if is_variant else "complementary"

        # Overall Actionability
        actionable = True
        reason_parts = []
        if is_redundant:
            actionable = False
            reason_parts.append("Redundant with simpler sub-rule")
        if is_popularity_driven:
            actionable = False
            reason_parts.append("Popularity-driven (lift near 1; consequent is already globally high volume)")
        if is_variant:
            # Variant rules can still be valid, but note them
            reason_parts.append("Color/design variant of the same product line")
        
        if not reason_parts:
            reason_parts.append("Strong genuine complementary association suitable for cross-sell or bundle")

        records.append({
            "id": f"rule_{idx}",
            "antecedents": [{"code": c, "label": label_map.get(c, f"Item {c}")} for c in ant_list],
            "consequents": [{"code": c, "label": label_map.get(c, f"Item {c}")} for c in con_list],
            "antecedent_codes": ant_list,
            "consequent_codes": con_list,
            "antecedent_support": round(ant_supp, 4),
            "consequent_support": round(con_supp, 4),
            "support": round(supp, 4),
            "confidence": round(conf, 4),
            "lift": round(lift_val, 4),
            "leverage": round(leverage, 4) if leverage is not None else None,
            "conviction": round(conv_val, 4) if conv_val is not None else None,
            "is_redundant": is_redundant,
            "is_popularity_driven": is_popularity_driven,
            "is_variant": is_variant,
            "rule_type": rule_type,
            "actionable": actionable,
            "reason": "; ".join(reason_parts)
        })

    return records


def execute_mining_run(
    algorithm: str = DEFAULT_ALGORITHM,
    min_support: float = DEFAULT_MIN_SUPPORT,
    min_confidence: float = DEFAULT_MIN_CONFIDENCE,
    min_lift: float = DEFAULT_MIN_LIFT,
    max_len: int = DEFAULT_MAX_LEN,
    use_cache: bool = True
) -> Dict[str, Any]:
    """Coordinates an end-to-end mining run with caching and execution timing."""
    cache_key = compute_cache_key(algorithm, min_support, min_confidence, min_lift, max_len)

    if use_cache:
        cached = get_cached_result(cache_key)
        if cached is not None:
            return cached

    matrix, label_map = load_matrix_and_labels()

    t_start = time.perf_counter()
    if algorithm.lower() == "apriori":
        itemsets_df = run_apriori(matrix, min_support=min_support, max_len=max_len)
    else:
        itemsets_df = run_fpgrowth(matrix, min_support=min_support, max_len=max_len)

    mining_runtime = time.perf_counter() - t_start

    t_rules_start = time.perf_counter()
    if not itemsets_df.empty:
        raw_rules = association_rules(itemsets_df, metric="confidence", min_threshold=min_confidence)
        if not raw_rules.empty and min_lift > 0:
            raw_rules = raw_rules[raw_rules["lift"] > min_lift]
        processed_rules = process_rules(raw_rules, label_map)
    else:
        processed_rules = []

    total_runtime = time.perf_counter() - t_start

    # Format itemsets for API display
    itemsets_summary = []
    if not itemsets_df.empty:
        sorted_itemsets = itemsets_df.sort_values(by="support", ascending=False).head(100)
        for _, row in sorted_itemsets.iterrows():
            codes = sorted(list(row["itemsets"]))
            itemsets_summary.append({
                "items": [{"code": c, "label": label_map.get(c, f"Item {c}")} for c in codes],
                "codes": codes,
                "support": round(float(row["support"]), 4),
                "item_count": len(codes)
            })

    output = {
        "cache_key": cache_key,
        "from_cache": False,
        "algorithm": algorithm,
        "min_support": min_support,
        "min_confidence": min_confidence,
        "min_lift": min_lift,
        "max_len": max_len,
        "n_baskets": int(len(matrix)),
        "n_items": int(matrix.shape[1]),
        "n_itemsets": int(len(itemsets_df)),
        "n_rules": len(processed_rules),
        "n_actionable_rules": sum(1 for r in processed_rules if r["actionable"]),
        "runtime_seconds": round(total_runtime, 4),
        "mining_runtime_seconds": round(mining_runtime, 4),
        "rules": processed_rules,
        "top_itemsets": itemsets_summary
    }

    save_cached_result(cache_key, output)
    return output


def precompute_default_results() -> Dict[str, Any]:
    """Runs default pre-registered configuration (FP-Growth, 1% support, 50% conf, lift > 1)
    and saves to backend/results/rules_default.json.
    """
    print("Running default mining run (FP-Growth, supp=1%, conf=50%, lift>1)...")
    result = execute_mining_run(
        algorithm="fpgrowth",
        min_support=DEFAULT_MIN_SUPPORT,
        min_confidence=DEFAULT_MIN_CONFIDENCE,
        min_lift=DEFAULT_MIN_LIFT,
        max_len=DEFAULT_MAX_LEN,
        use_cache=False
    )

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    default_rules_path = RESULTS_DIR / "rules_default.json"
    with open(default_rules_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Default mining complete: {result['n_itemsets']} itemsets, {result['n_rules']} rules in {result['runtime_seconds']:.2f}s")
    print(f"Saved default rules to {default_rules_path}")
    return result


if __name__ == "__main__":
    precompute_default_results()
