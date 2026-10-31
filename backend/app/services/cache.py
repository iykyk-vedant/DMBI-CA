"""Cache Service for Mining Runs and Precomputations.
Keys cached results by algorithm, hyperparameters, and dataset signature.
"""

import hashlib
import json
from pathlib import Path
from typing import Dict, Any, Optional

from app.config import CACHE_DIR


def compute_cache_key(
    algorithm: str,
    min_support: float,
    min_confidence: float,
    min_lift: float,
    max_len: int,
    scope: str = "UK_ge_2"
) -> str:
    """Generates a deterministic MD5 hash key for mining configurations."""
    raw_str = f"{algorithm}_{min_support:.5f}_{min_confidence:.4f}_{min_lift:.4f}_{max_len}_{scope}"
    return hashlib.md5(raw_str.encode("utf-8")).hexdigest()


def get_cached_result(cache_key: str) -> Optional[Dict[str, Any]]:
    """Retrieves cached json result if present."""
    cache_file = CACHE_DIR / f"{cache_key}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                data["from_cache"] = True
                return data
        except Exception:
            return None
    return None


def save_cached_result(cache_key: str, data: Dict[str, Any]) -> None:
    """Saves mining run output to cache directory."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{cache_key}.json"
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f)

