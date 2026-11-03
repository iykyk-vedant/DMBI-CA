import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageHeader } from '../components/analytics/PageHeader';
import { ChartCard } from '../components/analytics/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { LineChart, BarChart2, Share2, Filter, Sparkles, Layers } from 'lucide-react';
import { AssociationRule } from '../types';

export const VisualisationsPage: React.FC = () => {
  const [onlyActionable, setOnlyActionable] = useState<boolean>(true);
  const [topN, setTopN] = useState<number>(15);

  const { data: defaultData, isLoading } = useQuery({
    queryKey: ['rules', 'default'],
    queryFn: () => api.getRules({ limit: 100, sort_by: 'lift', order: 'desc' }),
  });

  const rules: AssociationRule[] = (defaultData?.rules ?? []).filter(
    (r) => !onlyActionable || r.actionable
  );

  // CA1 Viz #2: Top Rules Ranked by Lift
  const topRulesData = rules
    .slice(0, topN)
    .map((r) => {
      const ant = r.antecedents[0]?.label || 'A';
      const con = r.consequents[0]?.label || 'B';
      const shortAnt = ant.length > 20 ? ant.substring(0, 20) + '...' : ant;
      const shortCon = con.length > 20 ? con.substring(0, 20) + '...' : con;
      return {
        name: `${shortAnt} → ${shortCon}`,
        fullName: `${ant} → ${con}`,
        lift: r.lift,
        confidence: r.confidence * 100,
        support: r.support * 100,
        ruleType: r.rule_type,
      };
    })
    .reverse();

  // CA1 Viz #3: Support vs Confidence Scatter Plot (Lift as Z / Bubble Size)
  const scatterData = rules.slice(0, 60).map((r) => ({
    support: +(r.support * 100).toFixed(2),
    confidence: +(r.confidence * 100).toFixed(1),
    lift: +r.lift.toFixed(1),
    rule: `${r.antecedents[0]?.label} → ${r.consequents[0]?.label}`,
  }));

  // Network Nodes and Edges for SVG Network Graph
  const networkRules = rules.slice(0, 14);
  const nodesMap = new Map<string, { id: string; label: string; count: number }>();
  const edges: Array<{ source: string; target: string; lift: number }> = [];

  networkRules.forEach((r) => {
    const src = r.antecedents[0]?.code;
    const srcLbl = r.antecedents[0]?.label;
    const tgt = r.consequents[0]?.code;
    const tgtLbl = r.consequents[0]?.label;

    if (src && tgt) {
      if (!nodesMap.has(src)) nodesMap.set(src, { id: src, label: srcLbl, count: 1 });
      else nodesMap.get(src)!.count += 1;

      if (!nodesMap.has(tgt)) nodesMap.set(tgt, { id: tgt, label: tgtLbl, count: 1 });
      else nodesMap.get(tgt)!.count += 1;

      edges.push({ source: src, target: tgt, lift: r.lift });
    }
  });

  const nodes = Array.from(nodesMap.values());
  const width = 640;
  const height = 360;
  const radius = 125;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate circular layout positions
  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, idx) => {
    const angle = (idx / nodes.length) * 2 * Math.PI;
    nodePositions.set(n.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Pattern Visualisations"
        badgeColor="blue"
        icon={LineChart}
        title="Association Rule Visualisation Gallery"
        description="Empirical association strength rankings, metric trade-offs (Support vs Confidence vs Lift), and product graph network topologies."
        actions={
          <div className="flex items-center space-x-3 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyActionable}
                onChange={(e) => setOnlyActionable(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span>Actionable Rules Only</span>
            </label>
          </div>
        }
      />

      {/* 2. CA1 VIZ #2: TOP RULES RANKED BY LIFT */}
      <ChartCard
        title="CA1 Viz #2: Top Association Rules Ranked by Lift"
        subtitle="Lift indicates how much more often items co-occur compared to statistical independence. Lift > 10x denotes exceptionally strong retail affinities."
        badge="Ranked by Lift"
        heightClass="h-96"
        actions={
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Show Top:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        }
        footer="Top rules heavily feature complementary colorway variants and matched collections (e.g., Herb Markers, Regency Teaware, Retrospot Storage)."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={topRulesData} margin={{ top: 10, right: 40, left: 230, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} stroke="#CBD5E1" />
            <YAxis dataKey="name" type="category" tick={{ fill: '#1E293B', fontSize: 11 }} stroke="#CBD5E1" width={220} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                color: '#172033',
              }}
              formatter={(val: any, _name: any, item: any) => [
                `Lift: ${Number(val).toFixed(2)}x (Conf: ${item.payload.confidence.toFixed(1)}%, Supp: ${item.payload.support.toFixed(2)}%)`,
                item.payload.fullName,
              ]}
            />
            <Bar dataKey="lift" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. GRID: SUPPORT VS CONFIDENCE SCATTER & SVG NETWORK GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CA1 Viz #3: Support vs Confidence Scatter Plot */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  CA1 Visualisation #3
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Support vs Confidence (Bubble Size = Lift)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Top 60 Rules
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Rules situated in the upper-right quadrant with prominent bubble diameters represent premier cross-selling candidates possessing high confidence and strong lift.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  dataKey="support"
                  name="Support (%)"
                  unit="%"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="#CBD5E1"
                  label={{ value: 'Support (%)', position: 'bottom', fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="confidence"
                  name="Confidence (%)"
                  unit="%"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="#CBD5E1"
                  label={{ value: 'Confidence (%)', angle: -90, position: 'left', fill: '#64748B', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="lift" range={[40, 260]} name="Lift" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    color: '#172033',
                  }}
                  formatter={(val: any, name: any) => [`${val}`, name]}
                />
                <Scatter name="Rules" data={scatterData} fill="#059669" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Bubble diameter scales proportionally with association Lift factor.
          </div>
        </div>

        {/* Product Association Network Graph */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Product Association Network</h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Top Affinity Graph
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Topological co-purchase clusters. Circular nodes represent unique catalog products; connecting links denote mined association rules.
            </p>
          </div>

          <div className="w-full h-72 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-center relative overflow-hidden">
            <svg width={width} height={height} className="max-w-full max-h-full">
              {/* Edges */}
              {edges.map((e, idx) => {
                const p1 = nodePositions.get(e.source);
                const p2 = nodePositions.get(e.target);
                if (!p1 || !p2) return null;
                const strokeWidth = Math.min(Math.max(e.lift / 15, 1.2), 3.5);
                return (
                  <line
                    key={idx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#2563EB"
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.45}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                const pos = nodePositions.get(n.id);
                if (!pos) return null;
                return (
                  <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle r={10} fill="#2563EB" stroke="#1D4ED8" strokeWidth={2} />
                    <text
                      y={-14}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize={9}
                      className="select-none font-bold"
                    >
                      {n.label.substring(0, 14)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Line thickness corresponds to rule Lift strength between connected item pairs.
          </div>
        </div>
      </div>
    </div>
  );
};
