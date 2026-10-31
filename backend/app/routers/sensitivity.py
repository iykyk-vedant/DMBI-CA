"""Sensitivity Analysis REST Router."""

import json
from fastapi import APIRouter, HTTPException

from app.config import SENSITIVITY_RESULTS_PATH
from app.schemas import SensitivityResponse
from app.services.benchmark import run_sensitivity_analysis

router = APIRouter(prefix="/api/sensitivity", tags=["Sensitivity Analysis"])


@router.get("", response_model=SensitivityResponse)
def get_sensitivity():
    """Returns parameter sensitivity grid for 0.5%, 1.0%, and 2.0% support thresholds."""
    if not SENSITIVITY_RESULTS_PATH.exists():
        return run_sensitivity_analysis()

    with open(SENSITIVITY_RESULTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

