import {
  HealthStatus,
  RawProfile,
  PreprocessingStep,
  FinalCounts,
  EdaSummary,
  MiningDefaults,
  MiningResult,
  BenchmarkData,
  SensitivityData,
  RecommendationResponse,
  OfflineEvaluationData,
  DecisionMatrixItem,
  ProductCodeLabel
} from '../types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const BASE_URL = RAW_BASE
  ? RAW_BASE.replace(/\/+$/, '').endsWith('/api')
    ? RAW_BASE.replace(/\/+$/, '')
    : `${RAW_BASE.replace(/\/+$/, '')}/api`
  : '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  getHealth: () => fetchJson<HealthStatus>('/health'),
  getRawProfile: () => fetchJson<RawProfile>('/data/profile'),
  getPreprocessingLog: () => fetchJson<PreprocessingStep[]>('/data/preprocessing-log'),
  getFinalCounts: () => fetchJson<FinalCounts>('/data/final-counts'),
  getEda: () => fetchJson<EdaSummary>('/eda'),
  getMiningDefaults: () => fetchJson<MiningDefaults>('/mining/defaults'),
  runMining: (params: {
    algorithm: string;
    min_support: number;
    min_confidence: number;
    min_lift: number;
    max_len: number;
    use_cache?: boolean;
  }) => fetchJson<MiningResult>('/mining/run', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
  getRules: (params?: {
    sort_by?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    min_lift?: number;
    min_confidence?: number;
    only_actionable?: boolean;
    search?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          sp.append(k, String(v));
        }
      });
    }
    return fetchJson<{ total: number; offset: number; limit: number; rules: any[] }>(`/mining/rules?${sp.toString()}`);
  },
  getBenchmark: () => fetchJson<BenchmarkData>('/compare/benchmark'),
  getSensitivity: () => fetchJson<SensitivityData>('/sensitivity'),
  searchProducts: (q: string) => fetchJson<ProductCodeLabel[]>(`/recommend/products?q=${encodeURIComponent(q)}`),
  recommendProduct: (stockCode: string, k: number = 5) =>
    fetchJson<RecommendationResponse>(`/recommend?stock_code=${encodeURIComponent(stockCode)}&k=${k}`),
  recommendCart: (cartCodes: string[], k: number = 5) =>
    fetchJson<RecommendationResponse>('/recommend/basket', {
      method: 'POST',
      body: JSON.stringify({ cart_codes: cartCodes, k }),
    }),
  getOfflineEval: () => fetchJson<OfflineEvaluationData>('/recommend/evaluation'),
  getDecisionMatrix: () => fetchJson<DecisionMatrixItem[]>('/insights/decision-matrix'),
  getInsightsNarrative: () => fetchJson<{ content: string }>('/insights/narrative'),
};

