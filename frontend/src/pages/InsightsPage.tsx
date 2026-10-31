import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Lightbulb,
  Tag,
  ShoppingBag,
  Sparkles,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { data: narrativeData, isLoading } = useQuery({
    queryKey: ['insights-narrative'],
    queryFn: api.getInsightsNarrative,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Executive Business Insights & Decision Support</h1>
        <p className="text-sm text-slate-400 mt-1">
          Evidence-based merchandising recommendations derived directly from real transaction mining results.
        </p>
      </div>

      {/* Hero Takeaway Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/20 border border-blue-900/50 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-blue-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Core Merchandising Insight</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Wholesale and giftware consumers exhibit distinct multi-product affinity clusters. High-lift rules reveal that customers buying botanicals or storage lines buy multi-item collections in over <strong>80%</strong> of visits. Prioritizing <strong>Lift</strong> over raw Confidence prevents cluttering recommendations with generic bestsellers.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Actionable Merchandising */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">1. Contextual Cross-Selling Widgets</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deploy dynamic <em>"Frequently Bought Together"</em> modules on product pages. Pairing antecedent anchors with high-lift consequents (e.g. Herb Markers, Regency Teaware) drives immediate basket expansion.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Package className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">2. Pre-Packaged Product Bundling</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create unified bundle SKUs for complete colorway collections (e.g. Red + Pink + Blue Retrospot Bags) offered at a 5–10% bundle discount, increasing average order value with zero friction.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">3. Digital Shelf & Category Placement</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reorganize website category navigation to co-locate complementary party supplies (bunting, cake stands, light holders) within curated event themes rather than isolated product silos.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">4. Inventory Stocking Synchronization</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Link warehouse reordering schedules. Surges in antecedent demand trigger proactive replenishment alerts for high-confidence consequents to eliminate missed cross-sell stockouts.
          </p>
        </div>
      </div>

      {/* Markdown Report Render */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Complete Analytical Findings (docs/INSIGHTS.md)</h2>
          <span className="text-xs font-mono text-slate-400">Live Generated</span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
          <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-sans">
            {narrativeData?.content ?? 'Loading insights narrative...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

