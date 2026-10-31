"""Unit tests for the ProductRecommender engine."""

import pytest
from app.services.recommender import ProductRecommender


@pytest.fixture
def sample_recommender():
    sample_rules = [
        {
            "id": "rule_1",
            "antecedent_codes": ["ITEM_A"],
            "consequent_codes": ["ITEM_B"],
            "support": 0.05,
            "confidence": 0.80,
            "lift": 4.0,
            "rule_type": "complementary"
        },
        {
            "id": "rule_2",
            "antecedent_codes": ["ITEM_A", "ITEM_B"],
            "consequent_codes": ["ITEM_C"],
            "support": 0.03,
            "confidence": 0.75,
            "lift": 5.0,
            "rule_type": "complementary"
        }
    ]
    label_map = {
        "ITEM_A": "Test Product Alpha",
        "ITEM_B": "Test Product Beta",
        "ITEM_C": "Test Product Gamma",
        "ITEM_POP": "Popular Item Fallback"
    }
    popular_items = [{"code": "ITEM_POP", "label": "Popular Item Fallback"}]
    return ProductRecommender(sample_rules, label_map, popular_items)


def test_single_product_recommendation(sample_recommender):
    """Test recommendation when querying single product ITEM_A."""
    res = sample_recommender.recommend_for_product("ITEM_A", k=3)
    assert res["has_recommendations"] is True
    assert len(res["recommendations"]) == 2
    rec_codes = [r["code"] for r in res["recommendations"]]
    assert "ITEM_B" in rec_codes
    assert "ITEM_C" in rec_codes
    assert "Test Product Alpha" in res["recommendations"][0]["explanation"]


def test_cart_recommendation(sample_recommender):
    """Test recommendation when cart contains ITEM_A and ITEM_B."""
    cart = ["ITEM_A", "ITEM_B"]
    res = sample_recommender.recommend_for_cart(cart, k=3)
    assert res["has_recommendations"] is True
    rec_codes = [r["code"] for r in res["recommendations"]]
    assert "ITEM_C" in rec_codes
    assert "ITEM_A" not in rec_codes
    assert "ITEM_B" not in rec_codes


def test_empty_or_unknown_fallback(sample_recommender):
    """Test recommendation on unknown item triggers fallback."""
    res = sample_recommender.recommend_for_product("UNKNOWN_XYZ", k=1)
    assert res["has_recommendations"] is False
    assert len(res["fallback_popular"]) == 1
    assert res["fallback_popular"][0]["code"] == "ITEM_POP"
