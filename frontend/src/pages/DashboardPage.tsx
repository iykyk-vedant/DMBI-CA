import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { ProcessFlow } from '../components/ProcessFlow';
import { RuleTable } from '../components/RuleTable';
import { ShoppingCart, Package, TrendingUp, Sparkles, Database, ArrowRight } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50 mb-3">
            Continuous Assessment - 2 (CA2) • Data Mining & Business Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Market Basket Analysis & Product Recommendation
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            A case study-based data mining implementation using <strong>FP-Growth</strong> and <strong>Apriori</strong> on
            historical e-commerce transactions to identify frequent product combinations and generate high-lift recommendation strategies.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">Team: Vedant Gharat (50), Ayush Lokhande (55), Deepak Nishad (59), Ayush Yadav (69)</span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">Class: D15B, Sem-5</span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">Autonomous Institute: V.E.S.I.T.</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Valid UK Baskets"
          value={counts?.final_basket_count?.toLocaleString() ?? '16,506'}
          subtitle={`Avg basket size: ${counts?.average_basket_size?.toFixed(1) ?? '28.6'} items`}
          icon={ShoppingCart}
          badge=">= 2 Items"
          badgeColor="blue"
        />
        <StatCard
          title="Eligible Products"
          value={counts?.final_product_count?.toLocaleString() ?? '1,628'}
          subtitle="Support floor >= 0.5%"
          icon={Package}
          badge="Cleaned"
          badgeColor="emerald"
        />
        <StatCard
          title="Discovered Rules"
          value="1,865"
          subtitle="At supp >= 1%, conf >= 50%"
          icon={TrendingUp}
          badge="Lift > 1.0"
          badgeColor="amber"
        />
        <StatCard
          title="Highest Lift Mined"
          value={`${maxLift.toFixed(1)}x`}
          subtitle="Strongest product affinity"
          icon={Sparkles}
          badge="High Correlation"
          badgeColor="purple"
        />
      </div>

      {/* Process Flow */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Data Mining Lifecycle (CA1 Process Flow)
          </h2>
          <span className="text-xs text-slate-500">CRISP-DM Aligned</span>
        </div>
        <ProcessFlow currentStage={5} />
      </div>

      {/* Two Column Layout: Business Objectives & Top Product */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-2">Research Question & Business Goal</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            <em>How can historical retail transactions be analysed to discover which products are frequently purchased together,
            so that the retailer can generate data-driven product recommendations and cross-selling strategies?</em>
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-1">Evidence-Based Shortlisting</span>
              Rules with Lift &gt; 1 filter out false correlations, identifying genuine co-purchases for on-site merchandising.
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-emerald-400 block mb-1">Decision Boundary</span>
              Mining discovers correlation, not causation. All recommendation candidates are targeted for randomized A/B testing.
            </div>
          </div>
          <div className="mt-5 flex items-center space-x-3">
            <Link
              to="/explorer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              Open Mining Explorer <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
            <Link
              to="/recommender"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              Test Product Recommender
            </Link>
          </div>
        </div>

        {topProduct && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                #1 Best-Selling Anchor Product
              </span>
              <div className="font-mono text-sm text-blue-400">[{topProduct.stock_code}]</div>
              <div className="text-base font-bold text-white mt-1 leading-snug">{topProduct.label}</div>
              <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total UK Invoices:</span>
                  <span className="font-semibold text-white">{topProduct.invoice_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Basket Prevalence:</span>
                  <span className="font-semibold text-emerald-400">{topProduct.share_of_baskets_pct}%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Serves as a key basket anchor; customer sessions frequently initiate with this item before browsing complementary lines.
            </div>
          </div>
        )}
      </div>

      {/* Top Discovered Rules Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Top Discovered Association Rules (Ranked by Lift)</h2>
            <p className="text-xs text-slate-400">Mined with FP-Growth at Support ≥ 1.0%, Confidence ≥ 50.0%</p>
          </div>
          <Link to="/visualisations" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            View All Charts →
          </Link>
        </div>
        <RuleTable rules={rulesData?.rules ?? []} isLoading={rulesLoading} />
      </div>
    </div>
  );
};

