import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageHeader } from '../components/analytics/PageHeader';
import {
  Lightbulb,
  Sparkles,
  Package,
  Layers,
  TrendingUp,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { data: narrativeData } = useQuery({
    queryKey: ['insights-narrative'],
    queryFn: api.getInsightsNarrative,
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Executive Briefing"
        badgeColor="blue"
        icon={Lightbulb}
        title="Executive Business Insights &amp; Decision Support"
        description="Evidence-based merchandising strategies, inventory synchronizations, and bundling policies derived directly from real transaction mining data."
      />

      {/* 2. HERO TAKEAWAY BANNER */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/90 rounded-xl p-6 shadow-xs">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Core Commercial Takeaway</h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              Wholesale and giftware consumers exhibit distinct multi-product affinity clusters. High-lift rules reveal that customers purchasing botanical markers or storage lines order complete collections in over <strong>80%</strong> of sessions. Prioritizing <strong>Lift</strong> over raw Confidence prevents cluttering recommendations with generic bestsellers and boosts basket expansion.
            </p>
          </div>
        </div>
      </div>

      {/* 3. 4 PILLARS OF ACTIONABLE MERCHANDISING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-blue-600">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">1. Contextual Cross-Selling Widgets</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deploy dynamic <em>"Frequently Bought Together"</em> modules directly on product pages. Pairing antecedent anchors with high-lift consequents (e.g. Herb Markers, Regency Teaware) drives immediate basket expansion.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Package className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">2. Pre-Packaged Product Bundling</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Create unified bundle SKUs for complete colorway collections (e.g. Red + Pink + Blue Retrospot Bags) offered at a 5–10% bundle discount, increasing average order value with zero friction.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-purple-600">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">3. Digital Shelf &amp; Category Placement</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reorganize website category navigation to co-locate complementary party supplies (bunting, cake stands, light holders) within curated event themes rather than isolated product silos.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-600">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">4. Inventory Stocking Synchronization</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Link warehouse reordering schedules. Surges in antecedent demand trigger proactive replenishment alerts for high-confidence consequents to eliminate missed cross-sell stockouts.
          </p>
        </div>
      </div>

      {/* 4. MARKDOWN EXECUTIVE REPORT RENDER */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Complete Analytical Findings Report (docs/INSIGHTS.md)</h2>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Live Generated</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 overflow-x-auto text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
          {narrativeData?.content ?? 'Loading insights narrative...'}
        </div>
      </div>
    </div>
  );
};
