import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { RuleTable } from '../components/RuleTable';
import { MetricCard } from '../components/analytics/MetricCard';
import { PageHeader } from '../components/analytics/PageHeader';
import { Sliders, Play, RotateCcw, Search, Clock, CheckCircle, Database, Layers } from 'lucide-react';
import { MiningResult } from '../types';

export const ExplorerPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'fpgrowth' | 'apriori'>('fpgrowth');
  const [minSupport, setMinSupport] = useState<number>(0.01);
  const [minConfidence, setMinConfidence] = useState<number>(0.50);
  const [minLift, setMinLift] = useState<number>(1.0);
  const [maxLen, setMaxLen] = useState<number>(4);
  const [search, setSearch] = useState<string>('');
  const [onlyActionable, setOnlyActionable] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<MiningResult | null>(null);

  // Initial load uses precomputed default rules
  const { data: defaultData, isLoading: defaultLoading } = useQuery({
    queryKey: ['mining-defaults-run'],
    queryFn: () =>
      api.runMining({
        algorithm: 'fpgrowth',
        min_support: 0.01,
        min_confidence: 0.5,
        min_lift: 1.0,
        max_len: 4,
        use_cache: true,
      }),
  });

  const miningMutation = useMutation({
    mutationFn: api.runMining,
    onSuccess: (data) => {
      setActiveResult(data);
    },
  });

  const handleRun = () => {
    miningMutation.mutate({
      algorithm,
      min_support: minSupport,
      min_confidence: minConfidence,
      min_lift: minLift,
      max_len: maxLen,
      use_cache: true,
    });
  };

  const handleReset = () => {
    setAlgorithm('fpgrowth');
    setMinSupport(0.01);
    setMinConfidence(0.50);
    setMinLift(1.0);
    setMaxLen(4);
    setSearch('');
    setOnlyActionable(false);
    setActiveResult(defaultData ?? null);
  };

  const currentResult = activeResult || defaultData;
  const isRunning = miningMutation.isPending;

  // Filter rules based on search & actionable
  const filteredRules = (currentResult?.rules ?? []).filter((r) => {
    if (onlyActionable && !r.actionable) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAnt = r.antecedents.some((a) => a.label.toLowerCase().includes(q) || a.code.includes(q));
      const matchCon = r.consequents.some((c) => c.label.toLowerCase().includes(q) || c.code.includes(q));
      if (!matchAnt && !matchCon) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Interactive Laboratory"
        badgeColor="blue"
        icon={Sliders}
        title="Interactive Mining Explorer"
        description="Tune association rule hyperparameters, switch between FP-Growth and Apriori, adjust support/confidence/lift thresholds, and inspect filtered patterns."
        actions={
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
        }
      />

      {/* 2. CONTROL PANEL CARD */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Algorithm Parameters &amp; Pruning Thresholds
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">16,429 Baskets Loaded</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Algorithm Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Algorithm</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAlgorithm('fpgrowth')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  algorithm === 'fpgrowth'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                FP-Growth
              </button>
              <button
                type="button"
                onClick={() => setAlgorithm('apriori')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  algorithm === 'apriori'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Apriori
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block">FP-Growth uses compact prefix-tree</span>
          </div>

          {/* Min Support */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Min Support</label>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {(minSupport * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.0025"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Floor: 0.5% (82+ baskets)</span>
          </div>

          {/* Min Confidence */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Min Confidence</label>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.90"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">CA1 Default: 50%</span>
          </div>

          {/* Min Lift */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Min Lift</label>
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {minLift.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.2"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">&gt; 1.0 filters random coincidence</span>
          </div>

          {/* Run Action */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mining...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Mining</span>
                </>
              )}
            </button>
            {miningMutation.isError && (
              <span className="text-[10px] text-rose-600 mt-1 block truncate">
                {(miningMutation.error as Error).message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. RESULTS KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Itemsets Mined"
          value={currentResult?.n_itemsets?.toLocaleString() ?? '...'}
          subtitle={`Across ${currentResult?.n_baskets?.toLocaleString() ?? '16,429'} baskets`}
          icon={Database}
          badge="Frequent"
          badgeColor="blue"
        />
        <MetricCard
          title="Rules Discovered"
          value={currentResult?.n_rules?.toLocaleString() ?? '...'}
          subtitle={`${currentResult?.n_actionable_rules?.toLocaleString() ?? '...'} commercial candidates`}
          icon={CheckCircle}
          badge="Evaluated"
          badgeColor="emerald"
        />
        <MetricCard
          title="Pipeline Runtime"
          value={`${currentResult?.runtime_seconds?.toFixed(2) ?? '...'}s`}
          subtitle={`Mining: ${currentResult?.mining_runtime_seconds?.toFixed(2) ?? '...'}s`}
          icon={Clock}
          badge={currentResult?.from_cache ? 'Cached' : 'Live Run'}
          badgeColor={currentResult?.from_cache ? 'purple' : 'blue'}
        />
        <MetricCard
          title="Active Filter Ratio"
          value={`${filteredRules.length} / ${currentResult?.n_rules ?? 0}`}
          subtitle={onlyActionable ? 'Actionable only' : 'Showing all rules'}
          icon={Layers}
          badge={onlyActionable ? 'Filtered' : 'Unfiltered'}
          badgeColor="amber"
        />
      </div>

      {/* 4. SEARCH & ACTIONABLE FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products or codes (e.g. BAG, HEART, 85099B)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyActionable}
              onChange={(e) => setOnlyActionable(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span>Hide Redundant &amp; Variant Flags</span>
          </label>
        </div>
      </div>

      {/* 5. RULES TABLE */}
      <RuleTable rules={filteredRules} isLoading={defaultLoading || isRunning} />
    </div>
  );
};
