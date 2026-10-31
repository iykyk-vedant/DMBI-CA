"""Correctness unit test verifying association rule mining against the CA1 worked mini-example.
Reference: CA1 Section 7.2 (Worked Mini-Example) and ANTIGRAVITY_SPEC.md Section 14.
"""

import pytest
import pandas as pd
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules


@pytest.fixture
def mini_example_matrix():
    """Builds the 5-transaction matrix from CA1 Section 7.2:
    T1: A, B, C
    T2: A, C
    T3: A, D
    T4: B, C, E
    T5: A, B, C
    """
    transactions = [
        ["A", "B", "C"],
        ["A", "C"],
        ["A", "D"],
        ["B", "C", "E"],
        ["A", "B", "C"]
    ]
    all_items = ["A", "B", "C", "D", "E"]
    bool_data = [[item in tx for item in all_items] for tx in transactions]
    return pd.DataFrame(bool_data, columns=all_items, index=[f"T{i+1}" for i in range(5)])


def test_mini_example_frequent_itemsets(mini_example_matrix):
    """Verify frequent itemsets with min_support = 0.40 (2 out of 5 transactions)."""
    min_support = 0.40

    # FP-Growth
    fp_itemsets = fpgrowth(mini_example_matrix, min_support=min_support, use_colnames=True)
    # Apriori
    ap_itemsets = apriori(mini_example_matrix, min_support=min_support, use_colnames=True)

    # Sort itemsets by frozenset representation
    fp_sets = {frozenset(s): round(sup, 4) for s, sup in zip(fp_itemsets["itemsets"], fp_itemsets["support"])}
    ap_sets = {frozenset(s): round(sup, 4) for s, sup in zip(ap_itemsets["itemsets"], ap_itemsets["support"])}

    # Both algorithms must return the EXACT same frequent itemsets
    assert fp_sets == ap_sets

    # Expected surviving frequent itemsets
    expected_sets = {
        frozenset(["A"]): 0.80,         # 4/5
        frozenset(["B"]): 0.60,         # 3/5
        frozenset(["C"]): 0.80,         # 4/5
        frozenset(["A", "B"]): 0.40,    # 2/5
        frozenset(["A", "C"]): 0.60,    # 3/5
        frozenset(["B", "C"]): 0.60,    # 3/5
        frozenset(["A", "B", "C"]): 0.40# 2/5
    }
    assert fp_sets == expected_sets

    # D and E must be pruned
    assert frozenset(["D"]) not in fp_sets
    assert frozenset(["E"]) not in fp_sets


def test_mini_example_rules(mini_example_matrix):
    """Verify rules for A -> C and B -> C calculated in CA1 §7.2."""
    fp_itemsets = fpgrowth(mini_example_matrix, min_support=0.40, use_colnames=True)
    rules = association_rules(fp_itemsets, metric="confidence", min_threshold=0.50)

    # Find Rule A -> C
    rule_a_c = rules[(rules["antecedents"] == frozenset(["A"])) & (rules["consequents"] == frozenset(["C"]))]
    assert not rule_a_c.empty
    row_a_c = rule_a_c.iloc[0]
    assert pytest.approx(row_a_c["support"], 0.001) == 0.60
    assert pytest.approx(row_a_c["confidence"], 0.001) == 0.75
    assert pytest.approx(row_a_c["lift"], 0.001) == 0.9375  # 0.75 / 0.80

    # Find Rule B -> C
    rule_b_c = rules[(rules["antecedents"] == frozenset(["B"])) & (rules["consequents"] == frozenset(["C"]))]
    assert not rule_b_c.empty
    row_b_c = rule_b_c.iloc[0]
    assert pytest.approx(row_b_c["support"], 0.001) == 0.60
    assert pytest.approx(row_b_c["confidence"], 0.001) == 1.00
    assert pytest.approx(row_b_c["lift"], 0.001) == 1.25    # 1.00 / 0.80

