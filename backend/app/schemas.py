"""Pydantic v2 schemas for all FastAPI REST endpoints.
Defines typed request and response contracts shared conceptually with frontend TypeScript models.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str
    precomputed_results_available: bool
    dataset_cached: bool
    baskets_count: int
    products_count: int


class RawProfileMetrics(BaseModel):
    total_records: int
    columns: List[str]
    dtypes: Dict[str, str]
    distinct_invoices: int
    distinct_products: int
    distinct_customers: int
    countries_represented: int
    missing_counts: Dict[str, int]
    date_min: str
    date_max: str


class CA1ReferenceProfile(BaseModel):
    total_records: int
    distinct_invoices: int
    distinct_products: int
    distinct_customers: int
    countries_represented: int
    missing_descriptions: int
    missing_customer_ids: int
    source_note: str


class RawProfileResponse(BaseModel):
    computed: RawProfileMetrics
    ca1_reference: CA1ReferenceProfile
    discrepancy_explanation: str


class PreprocessingStepLog(BaseModel):
    step: int
    rule: str
    description: str
    rows_before: int
    rows_after: int
    rows_removed: int
    metadata: Optional[Dict[str, Any]] = None


class FinalCountsResponse(BaseModel):
    final_invoice_count: int
    final_basket_count: int
    total_valid_uk_baskets: int
    final_product_count: int
    average_basket_size: float
    median_basket_size: float
    matrix_shape: List[int]
    support_denominator: str
    denominator_count: int


class TopProductItem(BaseModel):
    rank: int
    stock_code: str
    label: str
    invoice_count: int
    share_of_baskets_pct: float


class MonthlyTrendItem(BaseModel):
    month: str
    invoice_count: int
    is_partial: bool
    note: str


class HistogramBin(BaseModel):
    bin: str
    count: int


class BasketSizeDistribution(BaseModel):
    histogram: List[HistogramBin]
    stats: Dict[str, float]


class CountryShareItem(BaseModel):
    rank: int
    country: str
    records: int
    share_pct: float


class EDAResponse(BaseModel):
    top_products: List[TopProductItem]
    monthly_trend: List[MonthlyTrendItem]
    basket_sizes: BasketSizeDistribution
    country_share: List[CountryShareItem]
    raw_outliers: Dict[str, Any]


class ProductCodeLabel(BaseModel):
    code: str
    label: str


class AssociationRuleItem(BaseModel):
    id: str
    antecedents: List[ProductCodeLabel]
    consequents: List[ProductCodeLabel]
    antecedent_codes: List[str]
    consequent_codes: List[str]
    antecedent_support: float
    consequent_support: float
    support: float
    confidence: float
    lift: float
    leverage: Optional[float] = None
    conviction: Optional[float] = None
    is_redundant: bool
    is_popularity_driven: bool
    is_variant: bool
    rule_type: str
    actionable: bool
    reason: str


class ItemsetSummaryItem(BaseModel):
    items: List[ProductCodeLabel]
    codes: List[str]
    support: float
    item_count: int


class MiningDefaultsResponse(BaseModel):
    default_algorithm: str
    default_min_support: float
    default_min_confidence: float
    default_min_lift: float
    default_max_len: int
    min_support_floor: float
    live_run_timeout_seconds: int
    allowed_algorithms: List[str]


class MiningRunRequest(BaseModel):
    algorithm: str = Field(default="fpgrowth", description="fpgrowth or apriori")
    min_support: float = Field(default=0.01, ge=0.005, le=0.5, description="Min support >= 0.005 (0.5%)")
    min_confidence: float = Field(default=0.50, ge=0.05, le=1.0)
    min_lift: float = Field(default=1.0, ge=0.0)
    max_len: int = Field(default=4, ge=2, le=6)
    use_cache: bool = True


class MiningRunResponse(BaseModel):
    cache_key: str
    from_cache: bool
    algorithm: str
    min_support: float
    min_confidence: float
    min_lift: float
    max_len: int
    n_baskets: int
    n_items: int
    n_itemsets: int
    n_rules: int
    n_actionable_rules: int
    runtime_seconds: float
    mining_runtime_seconds: float
    rules: List[AssociationRuleItem]
    top_itemsets: List[ItemsetSummaryItem]


class AlgorithmMetrics(BaseModel):
    runtime_seconds: float
    peak_memory_mb: float
    itemset_count: int
    timed_out: bool


class BenchmarkItem(BaseModel):
    min_support: float
    min_support_pct: str
    fpgrowth: AlgorithmMetrics
    apriori: AlgorithmMetrics
    itemsets_identical: bool
    speedup_factor: Optional[float] = None
    note: str


class BenchmarkResponse(BaseModel):
    dataset_baskets: int
    dataset_items: int
    max_len: int
    comparisons: List[BenchmarkItem]
    conclusion: str


class SensitivityPoint(BaseModel):
    min_support: float
    min_support_pct: str
    itemset_count: int
    rule_count: int
    actionable_rules: int
    runtime_seconds: float
    max_lift: float
    median_lift: float
    mean_lift: float


class SensitivityResponse(BaseModel):
    grid: List[SensitivityPoint]
    summary: str


class ProductSearchItem(BaseModel):
    code: str
    label: str


class RecommendationCandidate(BaseModel):
    code: str
    label: str
    lift: float
    confidence: float
    support: float
    rule_type: str
    explanation: str
    triggered_by: Optional[List[str]] = None


class ProductRecommendationResponse(BaseModel):
    query_product: ProductCodeLabel
    recommendations: List[RecommendationCandidate]
    has_recommendations: bool
    reason: str
    fallback_popular: List[Dict[str, Any]]


class CartRecommendationRequest(BaseModel):
    cart_codes: List[str]
    k: int = 5


class CartRecommendationResponse(BaseModel):
    cart: List[ProductCodeLabel]
    recommendations: List[RecommendationCandidate]
    has_recommendations: bool
    reason: str
    fallback_popular: List[Dict[str, Any]]


class EvalMetricRow(BaseModel):
    k: int
    rule_hit_rate_pct: float
    popularity_hit_rate_pct: float
    difference_pct: float


class OfflineEvaluationResponse(BaseModel):
    train_baskets: int
    test_baskets: int
    evaluated_test_baskets: int
    coverage_pct: float
    covered_baskets: int
    metrics: List[EvalMetricRow]
    honest_interpretation: str


class DecisionMatrixRow(BaseModel):
    mining_insight: str
    validation_before_action: str
    possible_decision: str
    example_rule_id: str
    category: str

