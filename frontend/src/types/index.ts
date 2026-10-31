export interface HealthStatus {
  status: string;
  precomputed_results_available: boolean;
  dataset_cached: boolean;
  baskets_count: number;
  products_count: number;
}

export interface RawProfile {
  computed: {
    total_records: number;
    columns: string[];
    dtypes: Record<string, string>;
    distinct_invoices: number;
    distinct_products: number;
    distinct_customers: number;
    countries_represented: number;
    missing_counts: Record<string, number>;
    date_min: string;
    date_max: string;
  };
  ca1_reference: {
    total_records: number;
    distinct_invoices: number;
    distinct_products: number;
    distinct_customers: number;
    countries_represented: number;
    missing_descriptions: number;
    missing_customer_ids: number;
    source_note: string;
  };
  discrepancy_explanation: string;
}

export interface PreprocessingStep {
  step: number;
  rule: string;
  description: string;
  rows_before: number;
  rows_after: number;
  rows_removed: number;
  metadata?: Record<string, any>;
}

export interface FinalCounts {
  final_invoice_count: number;
  final_basket_count: number;
  total_valid_uk_baskets: number;
  final_product_count: number;
  average_basket_size: number;
  median_basket_size: number;
  matrix_shape: [number, number];
  support_denominator: string;
  denominator_count: number;
}

export interface TopProduct {
  rank: number;
  stock_code: string;
  label: string;
  invoice_count: number;
  share_of_baskets_pct: number;
}

export interface MonthlyTrend {
  month: string;
  invoice_count: number;
  is_partial: boolean;
  note: string;
}

export interface BasketSizeDist {
  histogram: Array<{ bin: string; count: number }>;
  stats: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    p25: number;
    p75: number;
  };
}

export interface CountryShare {
  rank: number;
  country: string;
  records: number;
  share_pct: number;
}

export interface EdaSummary {
  top_products: TopProduct[];
  monthly_trend: MonthlyTrend[];
  basket_sizes: BasketSizeDist;
  country_share: CountryShare[];
  raw_outliers: {
    quantity: Record<string, number>;
    unit_price: Record<string, number>;
  };
}

export interface ProductCodeLabel {
  code: string;
  label: string;
}

export interface AssociationRule {
  id: string;
  antecedents: ProductCodeLabel[];
  consequents: ProductCodeLabel[];
  antecedent_codes: string[];
  consequent_codes: string[];
  antecedent_support: number;
  consequent_support: number;
  support: number;
  confidence: number;
  lift: number;
  leverage: number | null;
  conviction: number | null;
  is_redundant: boolean;
  is_popularity_driven: boolean;
  is_variant: boolean;
  rule_type: 'variant' | 'complementary';
  actionable: boolean;
  reason: string;
}

export interface MiningDefaults {
  default_algorithm: string;
  default_min_support: number;
  default_min_confidence: number;
  default_min_lift: number;
  default_max_len: number;
  min_support_floor: number;
  live_run_timeout_seconds: number;
  allowed_algorithms: string[];
}

export interface MiningResult {
  cache_key: string;
  from_cache: boolean;
  algorithm: string;
  min_support: number;
  min_confidence: number;
  min_lift: number;
  max_len: number;
  n_baskets: number;
  n_items: number;
  n_itemsets: number;
  n_rules: number;
  n_actionable_rules: number;
  runtime_seconds: number;
  mining_runtime_seconds: number;
  rules: AssociationRule[];
  top_itemsets: Array<{
    items: ProductCodeLabel[];
    codes: string[];
    support: number;
    item_count: number;
  }>;
}

export interface AlgorithmMetrics {
  runtime_seconds: number;
  peak_memory_mb: number;
  itemset_count: number;
  timed_out: boolean;
}

export interface BenchmarkComparison {
  min_support: number;
  min_support_pct: string;
  fpgrowth: AlgorithmMetrics;
  apriori: AlgorithmMetrics;
  itemsets_identical: boolean;
  speedup_factor: number | null;
  note: string;
}

export interface BenchmarkData {
  dataset_baskets: number;
  dataset_items: number;
  max_len: number;
  comparisons: BenchmarkComparison[];
  conclusion: string;
}

export interface SensitivityPoint {
  min_support: number;
  min_support_pct: string;
  itemset_count: number;
  rule_count: number;
  actionable_rules: number;
  runtime_seconds: number;
  max_lift: number;
  median_lift: number;
  mean_lift: number;
}

export interface SensitivityData {
  grid: SensitivityPoint[];
  summary: string;
}

export interface RecommendationCandidate {
  code: string;
  label: string;
  lift: number;
  confidence: number;
  support: number;
  rule_type: string;
  explanation: string;
  triggered_by?: string[];
}

export interface RecommendationResponse {
  query_product?: ProductCodeLabel;
  cart?: ProductCodeLabel[];
  recommendations: RecommendationCandidate[];
  has_recommendations: boolean;
  reason: string;
  fallback_popular: Array<{ code: string; label: string; invoice_count?: number }>;
}

export interface OfflineEvaluationData {
  train_baskets: number;
  test_baskets: number;
  evaluated_test_baskets: number;
  coverage_pct: number;
  covered_baskets: number;
  metrics: Array<{
    k: number;
    rule_hit_rate_pct: number;
    popularity_hit_rate_pct: number;
    difference_pct: number;
  }>;
  honest_interpretation: string;
}

export interface DecisionMatrixItem {
  mining_insight: string;
  validation_before_action: string;
  possible_decision: string;
  example_rule_id: string;
  category: string;
}

