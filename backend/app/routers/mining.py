"""Mining and Association Rules REST Router."""

import json
import threading
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query

from app.config import (
    DEFAULT_ALGORITHM,
    DEFAULT_MIN_SUPPORT,
    DEFAULT_MIN_CONFIDENCE,
    DEFAULT_MIN_LIFT,
    DEFAULT_MAX_LEN,
    MIN_SUPPORT_FLOOR,
    LIVE_RUN_TIMEOUT_SECONDS,
    RESULTS_DIR
)
from app.schemas import (
    MiningDefaultsResponse,
    MiningRunRequest,
    MiningRunResponse,
    AssociationRuleItem,
    ItemsetSummaryItem
)
from app.services.mining import execute_mining_run

router = APIRouter(prefix="/api/mining", tags=["Mining Engine"])

# Concurrency lock to prevent multiple heavy live runs
MINING_LOCK = threading.Lock()


@router.get("/defaults", response_model=MiningDefaultsResponse)
def get_mining_defaults():
    """Returns system default mining parameters and safety limits."""
    return {
        "default_algorithm": DEFAULT_ALGORITHM,
        "default_min_support": DEFAULT_MIN_SUPPORT,
        "default_min_confidence": DEFAULT_MIN_CONFIDENCE,
        "default_min_lift": DEFAULT_MIN_LIFT,
        "default_max_len": DEFAULT_MAX_LEN,
        "min_support_floor": MIN_SUPPORT_FLOOR,
        "live_run_timeout_seconds": LIVE_RUN_TIMEOUT_SECONDS,
        "allowed_algorithms": ["fpgrowth", "apriori"]
    }


@router.post("/run", response_model=MiningRunResponse)
def run_mining(req: MiningRunRequest):
    """Executes association rule mining live or retrieves from cache."""
    # Guardrail check
    if req.min_support < MIN_SUPPORT_FLOOR:
        raise HTTPException(
            status_code=422,
            detail=f"Minimum support {req.min_support*100:.2f}% is below the safety floor of {MIN_SUPPORT_FLOOR*100:.1f}%. "
                   f"Running below this threshold can cause memory exhaustion."
        )

    algo = req.algorithm.lower().strip()
    if algo not in ["fpgrowth", "apriori"]:
        raise HTTPException(status_code=400, detail="Invalid algorithm. Choose 'fpgrowth' or 'apriori'.")

    # If already cached, return immediately without locking
    from app.services.cache import compute_cache_key, get_cached_result
    cache_key = compute_cache_key(algo, req.min_support, req.min_confidence, req.min_lift, req.max_len)
    if req.use_cache:
        cached = get_cached_result(cache_key)
        if cached:
            return cached

    # Acquire lock for live execution
    acquired = MINING_LOCK.acquire(blocking=True, timeout=5.0)
    if not acquired:
        raise HTTPException(status_code=429, detail="A mining run is currently in progress. Please wait and try again.")

    try:
        result = execute_mining_run(
            algorithm=algo,
            min_support=req.min_support,
            min_confidence=req.min_confidence,
            min_lift=req.min_lift,
            max_len=req.max_len,
            use_cache=req.use_cache
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Mining execution failed: {str(exc)}")
    finally:
        MINING_LOCK.release()


@router.get("/rules")
def get_rules(
    sort_by: str = Query(default="lift", regex="^(lift|confidence|support|leverage|conviction)$"),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    min_lift: float = Query(default=1.0, ge=0.0),
    min_confidence: float = Query(default=0.50, ge=0.0, le=1.0),
    only_actionable: bool = Query(default=False),
    search: Optional[str] = Query(default=None)
):
    """Returns paginated, searchable, and sortable association rules."""
    default_rules_path = RESULTS_DIR / "rules_default.json"
    if not default_rules_path.exists():
        execute_mining_run()

    with open(default_rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rules = data.get("rules", [])

    # Filter
    filtered = []
    search_lower = search.lower().strip() if search else None

    for r in rules:
        if r["lift"] < min_lift:
            continue
        if r["confidence"] < min_confidence:
            continue
        if only_actionable and not r["actionable"]:
            continue
        if search_lower:
            ant_labels = " ".join([a["label"].lower() for a in r["antecedents"]])
            con_labels = " ".join([c["label"].lower() for c in r["consequents"]])
            if search_lower not in ant_labels and search_lower not in con_labels:
                continue
        filtered.append(r)

    # Sort
    reverse = (order == "desc")
    filtered.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by) or 0.0), reverse=reverse)

    total_count = len(filtered)
    paged = filtered[offset : offset + limit]

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "rules": paged
    }


@router.get("/itemsets")
def get_itemsets(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    """Returns paginated frequent itemsets from default run."""
    default_rules_path = RESULTS_DIR / "rules_default.json"
    if not default_rules_path.exists():
        execute_mining_run()

    with open(default_rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    itemsets = data.get("top_itemsets", [])
    return {
        "total": len(itemsets),
        "offset": offset,
        "limit": limit,
        "itemsets": itemsets[offset : offset + limit]
    }

