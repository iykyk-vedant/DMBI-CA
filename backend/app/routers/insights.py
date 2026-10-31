"""Business Insights and Decision Support REST Router."""

import json
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from app.config import DECISION_MATRIX_PATH, DOCS_DIR
from app.schemas import DecisionMatrixRow
from app.services.recommender import build_rule_decision_matrix

router = APIRouter(prefix="/api/insights", tags=["Business Insights"])


@router.get("/decision-matrix", response_model=List[DecisionMatrixRow])
def get_decision_matrix():
    """Populates the CA1 Section 9.8 Rule-to-Decision matrix with real discovered rules."""
    if not DECISION_MATRIX_PATH.exists():
        return build_rule_decision_matrix()

    with open(DECISION_MATRIX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/narrative")
def get_insights_narrative():
    """Returns the markdown text of docs/INSIGHTS.md for display on the frontend Insights page."""
    insights_file = DOCS_DIR / "INSIGHTS.md"
    if insights_file.exists():
        with open(insights_file, "r", encoding="utf-8") as f:
            return {"content": f.read()}
    return {
        "content": "# Business Insights\n\nRun `python backend/scripts/generate_insights.py` to compile live insights."
    }

