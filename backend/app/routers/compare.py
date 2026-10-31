"""Algorithm Comparison REST Router."""

import json
from fastapi import APIRouter, HTTPException

from app.config import BENCHMARK_RESULTS_PATH
from app.schemas import BenchmarkResponse
from app.services.benchmark import run_comparative_benchmark

router = APIRouter(prefix="/api/compare", tags=["Algorithm Comparison"])


@router.get("/benchmark", response_model=BenchmarkResponse)
def get_benchmark_results():
    """Returns precomputed FP-Growth vs Apriori runtime and memory benchmarks."""
    if not BENCHMARK_RESULTS_PATH.exists():
        return run_comparative_benchmark()

    with open(BENCHMARK_RESULTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/run", response_model=BenchmarkResponse)
def run_live_benchmark():
    """Executes a live comparative benchmark across support levels."""
    try:
        return run_comparative_benchmark()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Benchmark execution failed: {str(exc)}")

