"""Automated integration tests for FastAPI backend endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns status healthy and metadata."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "precomputed_results_available" in data


def test_preprocessing_log_endpoint():
    """Verify preprocessing log returns 11 ordered steps with row metrics."""
    response = client.get("/api/data/preprocessing-log")
    assert response.status_code == 200
    steps = response.json()
    assert len(steps) >= 10
    step_nums = [s["step"] for s in steps]
    assert step_nums == sorted(step_nums)
    # Check that cancellation filter is recorded
    cancellation_step = next((s for s in steps if "cancellation" in s["rule"].lower()), None)
    assert cancellation_step is not None
    assert cancellation_step["rows_removed"] > 0


def test_final_counts_endpoint():
    """Verify final counts returns valid post-cleaning statistics."""
    response = client.get("/api/data/final-counts")
    assert response.status_code == 200
    counts = response.json()
    assert counts["final_basket_count"] > 10000
    assert counts["final_product_count"] > 1000
    assert counts["average_basket_size"] > 10.0


def test_eda_top_products_endpoint():
    """Verify EDA top products returns ranked list with labels."""
    response = client.get("/api/eda/top-products?n=10")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 10
    assert items[0]["rank"] == 1
    assert "label" in items[0]
    assert "stock_code" in items[0]


def test_mining_defaults_endpoint():
    """Verify mining defaults matches CA1 pre-registered parameters."""
    response = client.get("/api/mining/defaults")
    assert response.status_code == 200
    data = response.json()
    assert data["default_min_support"] == 0.01
    assert data["default_min_confidence"] == 0.50
    assert data["default_min_lift"] == 1.0
    assert data["min_support_floor"] == 0.005


def test_mining_rules_query():
    """Verify /api/mining/rules supports pagination and filtering."""
    response = client.get("/api/mining/rules?limit=5&offset=0&sort_by=lift&order=desc")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "rules" in data
    assert len(data["rules"]) <= 5
    if len(data["rules"]) >= 2:
        assert data["rules"][0]["lift"] >= data["rules"][1]["lift"]


def test_mining_floor_guardrail():
    """Verify that requesting support below floor (0.005) returns HTTP 422."""
    payload = {
        "algorithm": "fpgrowth",
        "min_support": 0.001,  # below 0.005 floor
        "min_confidence": 0.50,
        "min_lift": 1.0,
        "max_len": 4
    }
    response = client.post("/api/mining/run", json=payload)
    assert response.status_code == 422


def test_recommend_endpoints():
    """Verify product autocomplete and recommendation endpoints."""
    # Autocomplete
    search_res = client.get("/api/recommend/products?q=BAG")
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) > 0
    test_code = results[0]["code"]

    # Single product recommendation
    rec_res = client.get(f"/api/recommend?stock_code={test_code}&k=3")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "query_product" in rec_data
    assert "recommendations" in rec_data

    # Cart recommendation
    cart_res = client.post("/api/recommend/basket", json={"cart_codes": [test_code], "k": 3})
    assert cart_res.status_code == 200
    cart_data = cart_res.json()
    assert "cart" in cart_data
    assert "recommendations" in cart_data


def test_offline_eval_endpoint():
    """Verify offline evaluation returns metrics against popularity baseline."""
    response = client.get("/api/recommend/evaluation")
    assert response.status_code == 200
    eval_data = response.json()
    assert eval_data["evaluated_test_baskets"] > 0
    assert eval_data["coverage_pct"] > 50.0
    assert len(eval_data["metrics"]) == 3


def test_decision_matrix_endpoint():
    """Verify decision matrix returns 4 CA1 decision rows."""
    response = client.get("/api/insights/decision-matrix")
    assert response.status_code == 200
    matrix = response.json()
    assert len(matrix) == 4
    categories = [row["category"] for row in matrix]
    assert "Cross-Selling / Recommendation" in categories
    assert "Product Bundling" in categories

