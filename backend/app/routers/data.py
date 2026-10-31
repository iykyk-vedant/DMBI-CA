"""Data and Preprocessing REST Router."""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.config import (
    RAW_PROFILE_PATH,
    PREPROCESSING_LOG_PATH,
    FINAL_COUNTS_PATH,
    EDA_SUMMARY_PATH,
    BASKET_MATRIX_PARQUET_PATH,
    RAW_PARQUET_PATH
)
from app.schemas import (
    HealthResponse,
    RawProfileResponse,
    PreprocessingStepLog,
    FinalCountsResponse,
    EDAResponse,
    TopProductItem,
    MonthlyTrendItem,
    BasketSizeDistribution
)

router = APIRouter(prefix="/api", tags=["Data & Preprocessing"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint and dataset/results availability status."""
    has_results = FINAL_COUNTS_PATH.exists() and PREPROCESSING_LOG_PATH.exists()
    has_dataset = RAW_PARQUET_PATH.exists()
    
    b_count = 0
    p_count = 0
    if FINAL_COUNTS_PATH.exists():
        with open(FINAL_COUNTS_PATH, "r", encoding="utf-8") as f:
            counts = json.load(f)
            b_count = counts.get("final_basket_count", 0)
            p_count = counts.get("final_product_count", 0)

    return {
        "status": "healthy",
        "precomputed_results_available": has_results,
        "dataset_cached": has_dataset,
        "baskets_count": b_count,
        "products_count": p_count
    }


@router.get("/data/profile", response_model=RawProfileResponse)
def get_raw_profile():
    """Returns recomputed dataset profile side-by-side with CA1 reference figures."""
    if not RAW_PROFILE_PATH.exists():
        raise HTTPException(status_code=404, detail="Raw profile not yet generated. Run preprocessing first.")
    with open(RAW_PROFILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/data/preprocessing-log", response_model=List[PreprocessingStepLog])
def get_preprocessing_log():
    """Returns the ordered 11-step preprocessing log table with rows before/after/removed."""
    if not PREPROCESSING_LOG_PATH.exists():
        raise HTTPException(status_code=404, detail="Preprocessing log not found. Run preprocessing first.")
    with open(PREPROCESSING_LOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/data/final-counts", response_model=FinalCountsResponse)
def get_final_counts():
    """Returns final post-cleaning invoice, basket, product counts, and matrix shape."""
    if not FINAL_COUNTS_PATH.exists():
        raise HTTPException(status_code=404, detail="Final counts not found. Run preprocessing first.")
    with open(FINAL_COUNTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/eda", response_model=EDAResponse)
def get_full_eda():
    """Returns complete EDA distribution summary."""
    if not EDA_SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="EDA summary not found. Run EDA first.")
    with open(EDA_SUMMARY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/eda/top-products", response_model=List[TopProductItem])
def get_top_products(n: int = Query(default=10, ge=1, le=50)):
    """CA1 Visualisation #1: Top products by number of valid UK invoices containing them."""
    if not EDA_SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="EDA summary not found.")
    with open(EDA_SUMMARY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("top_products", [])[:n]


@router.get("/eda/monthly", response_model=List[MonthlyTrendItem])
def get_monthly_trend():
    """Monthly transaction volume trend."""
    if not EDA_SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="EDA summary not found.")
    with open(EDA_SUMMARY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("monthly_trend", [])


@router.get("/eda/basket-sizes", response_model=BasketSizeDistribution)
def get_basket_sizes():
    """Basket size histogram and distribution statistics."""
    if not EDA_SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="EDA summary not found.")
    with open(EDA_SUMMARY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("basket_sizes", {})

