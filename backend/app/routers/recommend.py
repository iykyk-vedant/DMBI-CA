"""Product Recommender and Offline Evaluation REST Router."""

import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query

from app.config import (
    RECOMMENDER_EVAL_PATH,
    LABEL_MAP_PATH
)
from app.schemas import (
    ProductSearchItem,
    ProductRecommendationResponse,
    CartRecommendationRequest,
    CartRecommendationResponse,
    OfflineEvaluationResponse
)
from app.services.recommender import (
    get_default_recommender,
    run_offline_evaluation
)

router = APIRouter(prefix="/api/recommend", tags=["Product Recommender"])


@router.get("/products", response_model=List[ProductSearchItem])
def search_products(q: str = Query(default="", description="Search substring for code or product label")):
    """Product autocomplete search endpoint."""
    if not LABEL_MAP_PATH.exists():
        return []

    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map: Dict[str, str] = json.load(f)

    clean_q = q.lower().strip()
    results = []

    for code, label in label_map.items():
        if not clean_q or (clean_q in code.lower()) or (clean_q in label.lower()):
            results.append({"code": code, "label": label})
            if len(results) >= 30:
                break

    return results


@router.get("", response_model=ProductRecommendationResponse)
def recommend_single(stock_code: str = Query(..., description="StockCode of product"), k: int = Query(default=5, ge=1, le=20)):
    """Returns top-k candidate recommendations for a single product with explanations."""
    recommender = get_default_recommender()
    return recommender.recommend_for_product(stock_code, k=k)


@router.post("/basket", response_model=CartRecommendationResponse)
def recommend_cart(req: CartRecommendationRequest):
    """Cart Simulator: evaluates active multi-item cart and returns top recommendations with explanations."""
    recommender = get_default_recommender()
    return recommender.recommend_for_cart(req.cart_codes, k=req.k)


@router.get("/evaluation", response_model=OfflineEvaluationResponse)
def get_offline_evaluation():
    """Returns leave-one-out chronological 80/20 train/test offline evaluation metrics."""
    if not RECOMMENDER_EVAL_PATH.exists():
        return run_offline_evaluation()

    with open(RECOMMENDER_EVAL_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

