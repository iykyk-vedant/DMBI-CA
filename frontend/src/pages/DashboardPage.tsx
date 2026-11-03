import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { MetricCard } from '../components/analytics/MetricCard';
import { ProcessFlow } from '../components/ProcessFlow';
import { RuleTable } from '../components/RuleTable';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Store,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: counts } = useQuery({ queryKey: ['final-counts'], queryFn: api.getFinalCounts });
  const { data: eda } = useQuery({ queryKey: ['eda'], queryFn: api.getEda });
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['rules', 'default'],
    queryFn: () => api.getRules({ limit: 5, sort_by: 'lift', order: 'desc' }),
  });

  const topProduct = eda?.top_products?.[0];
  const maxLift = rulesData?.rules?.[0]?.lift ?? 75.03;

  return (
    <div className="space-y-6">
      {/* 1. ACADEMIC & EXECUTIVE HERO CARD */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Continuous Assessment - 2 (CA2) • Data Mining &amp; Business Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Market Basket Analysis &amp; Product Recommendation Platform
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              An enterprise-grade, reproducibility-verified data mining pipeline implementing <strong>FP-Growth</strong> and <strong>Apriori</strong> algorithms
              on historical retail transactions (UCI Online Retail). Discovers actionable frequent itemsets, high-lift association rules, and cross-selling bundles
              with full mathematical proofs and offline train/test evaluation.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600">
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                <strong>Institution:</strong> V.E.S.I.T. Autonomous Institute
              </span>
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                <strong>Guide:</strong> Prof. Sukanya Roychowdhury
              </span>
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                <strong>Class:</strong> D15B (Semester 5)
              </span>
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                <strong>Team:</strong> Gharat (50), Lokhande (55), Nishad (59), Yadav (69)
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Launch Commercial Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#rules-summary"
              className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Review Discovered Rules</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. COMMERCIAL STOREFRONT INTEGRATION CALLOUT BANNER */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/40 border border-blue-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 shadow-2xs flex items-center justify-center shrink-0 text-blue-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Live E-Commerce Storefront Demonstration
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Experience association rule mining translated into real-world consumer merchandising. Clean, commercial Nykaa &amp; Amazon style shopping portal featuring live <em>"Frequently Bought Together"</em> bundled add-ons, dynamic cart drawer cross-sells, and transparent rule proofs.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs shrink-0 transition-colors"
        >
          <span>Open Storefront</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3. KEY PERFORMANCE INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Valid UK Baskets"
          value={counts?.final_basket_count?.toLocaleString() ?? '16,506'}
          subtitle={`Avg basket size: ${counts?.average_basket_size?.toFixed(1) ?? '28.6'} items`}
          icon={ShoppingCart}
          badge=">= 2 Items"
          badgeColor="blue"
        />
        <MetricCard
          title="Eligible Products"
          value={counts?.final_product_count?.toLocaleString() ?? '1,628'}
          subtitle="Support floor >= 0.5% (82+ orders)"
          icon={Package}
          badge="Cleaned"
          badgeColor="emerald"
        />
        <MetricCard
          title="Discovered Rules"
          value="1,865"
          subtitle="Supp >= 1.0%, Conf >= 50.0%"
          icon={TrendingUp}
          badge="Lift > 1.0"
          badgeColor="amber"
        />
        <MetricCard
          title="Highest Lift Mined"
          value={`${maxLift.toFixed(1)}x`}
          subtitle="Strongest product affinity"
          icon={Sparkles}
          badge="High Correlation"
          badgeColor="purple"
        />
      </div>

      {/* 4. PROCESS FLOW */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Data Mining Lifecycle (CRISP-DM Aligned Pipeline)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">End-to-end execution path from raw transaction ingestion to live evaluation</p>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Phase 5 Complete
          </span>
        </div>
        <ProcessFlow currentStage={5} />
      </div>

      {/* 5. TWO COLUMN SECTION: BUSINESS GOAL & ANCHOR PRODUCT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Research Question &amp; Analytical Framework
              </h3>
              <span className="text-xs font-mono text-slate-400">CA1 Section 2</span>
            </div>

            <blockquote className="border-l-3 border-blue-600 pl-4 py-1 text-sm text-slate-700 italic leading-relaxed bg-slate-50/60 rounded-r-lg">
              &ldquo;How can historical retail transactions be analysed to discover which products are frequently purchased together,
              so that the retailer can generate data-driven product recommendations and cross-selling strategies?&rdquo;
            </blockquote>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-blue-700 block mb-1">Evidence-Based Shortlisting</span>
                Rules with Lift &gt; 1 filter out spurious correlations and independent co-occurrences, identifying genuine product affinity for catalog bundling.
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-emerald-700 block mb-1">Decision Boundary</span>
                Association mining demonstrates correlation, not causal uplift. All recommendation candidates are pre-conditioned for randomized A/B verification.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <Link
              to="/analytics?tab=explorer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Interactive Mining Explorer</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
            <Link
              to="/analytics?tab=recommender"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
            >
              <span>Test Product Recommender</span>
            </Link>
          </div>
        </div>

        {/* Top Product Anchor Card */}
        {topProduct && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  #1 Best-Selling Anchor Product
                </span>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  [{topProduct.stock_code}]
                </span>
              </div>

              <div className="text-base font-bold text-slate-900 leading-snug">
                {topProduct.label}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Valid UK Invoices:</span>
                  <span className="font-mono font-bold text-slate-900">{topProduct.invoice_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Basket Prevalence:</span>
                  <span className="font-mono font-bold text-emerald-600">{topProduct.share_of_baskets_pct}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Catalog Role:</span>
                  <span className="font-semibold text-slate-700">Primary Traffic Driver</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Serves as a high-frequency basket anchor; sessions frequently initiate with this item before browsing complementary giftware.
            </div>
          </div>
        )}
      </div>

      {/* 6. TOP DISCOVERED RULES TABLE */}
      <div id="rules-summary" className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Discovered Association Rules (Ranked by Lift)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Mined via FP-Growth at Support ≥ 1.0%, Confidence ≥ 50.0%</p>
          </div>
          <Link
            to="/analytics?tab=visualisations"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
          >
            <span>View All Rules &amp; Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RuleTable rules={rulesData?.rules ?? []} isLoading={rulesLoading} />
      </div>
    </div>
  );
};
