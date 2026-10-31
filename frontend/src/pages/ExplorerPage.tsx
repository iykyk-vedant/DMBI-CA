import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { RuleTable } from '../components/RuleTable';
import { StatCard } from '../components/StatCard';
import { Sliders, Play, RotateCcw, Search, Filter, Clock, CheckCircle, Database } from 'lucide-react';
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Mining Explorer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tune association rule mining hyperparameters, compare algorithm speeds, and filter actionable patterns.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Algorithm & Threshold Controls</h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Algorithm */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Algorithm</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAlgorithm('fpgrowth')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  algorithm === 'fpgrowth'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                FP-Growth
              </button>
              <button
                type="button"
                onClick={() => setAlgorithm('apriori')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  algorithm === 'apriori'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Apriori
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">FP-Growth uses compact tree structure</span>
          </div>

          {/* Min Support */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Min Support</label>
              <span className="font-mono text-xs font-bold text-blue-400">{(minSupport * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.0025"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Floor: 0.5% (82+ baskets)</span>
          </div>

          {/* Min Confidence */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Min Confidence</label>
              <span className="font-mono text-xs font-bold text-emerald-400">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.90"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">CA1 pre-registered default: 50%</span>
          </div>

          {/* Min Lift */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Min Lift</label>
              <span className="font-mono text-xs font-bold text-amber-400">{minLift.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.2"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">&gt; 1.0 filters random coincidence</span>
          </div>

          {/* Run Action */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
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
              <span className="text-[10px] text-rose-400 mt-1 block truncate">
                {(miningMutation.error as Error).message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Itemsets Mined"
          value={currentResult?.n_itemsets?.toLocaleString() ?? '...'}
          subtitle={`Across ${currentResult?.n_baskets?.toLocaleString() ?? 16429} baskets`}
          icon={Database}
        />
        <StatCard
          title="Rules Discovered"
          value={currentResult?.n_rules?.toLocaleString() ?? '...'}
          subtitle={`${currentResult?.n_actionable_rules?.toLocaleString() ?? '...'} commercial candidates`}
          icon={CheckCircle}
          badge="Evaluated"
          badgeColor="emerald"
        />
        <StatCard
          title="Pipeline Runtime"
          value={`${currentResult?.runtime_seconds?.toFixed(2) ?? '...'}s`}
          subtitle={`Mining: ${currentResult?.mining_runtime_seconds?.toFixed(2) ?? '...'}s`}
          icon={Clock}
          badge={currentResult?.from_cache ? 'Cached' : 'Live Run'}
          badgeColor={currentResult?.from_cache ? 'purple' : 'blue'}
        />
        <StatCard
          title="Active Filter Ratio"
          value={`${filteredRules.length} / ${currentResult?.n_rules ?? 0}`}
          subtitle={onlyActionable ? 'Actionable only' : 'Showing all rules'}
          badge={onlyActionable ? 'Filtered' : 'Unfiltered'}
          badgeColor="amber"
        />
      </div>

      {/* Search and Actionable Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products or codes (e.g. BAG, HEART)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={onlyActionable}
              onChange={(e) => setOnlyActionable(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Hide Redundant & Popularity Flags</span>
          </label>
        </div>
      </div>

      {/* Rules Table */}
      <RuleTable rules={filteredRules} isLoading={defaultLoading || isRunning} />
    </div>
  );
};

