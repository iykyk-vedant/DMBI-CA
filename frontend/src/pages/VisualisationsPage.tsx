import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
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
import { LineChart, BarChart2, Share2, Filter } from 'lucide-react';
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
  const topRulesData = rules.slice(0, topN).map((r) => {
    const ant = r.antecedents[0]?.label || 'A';
    const con = r.consequents[0]?.label || 'B';
    const shortAnt = ant.length > 18 ? ant.substring(0, 18) + '...' : ant;
    const shortCon = con.length > 18 ? con.substring(0, 18) + '...' : con;
    return {
      name: `${shortAnt} → ${shortCon}`,
      fullName: `${ant} → ${con}`,
      lift: r.lift,
      confidence: r.confidence * 100,
      support: r.support * 100,
      ruleType: r.rule_type,
    };
  }).reverse();

  // CA1 Viz #3: Support vs Confidence Scatter Plot (Lift as Z / Color)
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
  const radius = 130;
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Association Rule Visualisations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical association strength, metric trade-offs, and product relationship clusters.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={onlyActionable}
              onChange={(e) => setOnlyActionable(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Only Actionable Rules</span>
          </label>
        </div>
      </div>

      {/* CA1 Viz #2: Top Rules Ranked by Lift */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800 mb-1">
              CA1 Visualisation #2
            </div>
            <h2 className="text-base font-semibold text-white">Top Association Rules Ranked by Lift</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Show Top:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Lift measures how much more frequently products are bought together compared to random chance. Lift values above 10x represent high commercial co-occurrence.
        </p>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topRulesData} margin={{ top: 10, right: 40, left: 220, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, _name: any, item: any) => [
                  `Lift: ${Number(val).toFixed(2)}x (Conf: ${item.payload.confidence.toFixed(1)}%, Supp: ${item.payload.support.toFixed(2)}%)`,
                  item.payload.fullName,
                ]}
              />
              <Bar dataKey="lift" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Support vs Confidence Scatter & Rule Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CA1 Viz #3: Support vs Confidence Scatter Plot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 mb-1">
              CA1 Visualisation #3
            </div>
            <h2 className="text-base font-semibold text-white">Support vs Confidence (Bubble Size = Lift)</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Demonstrates the distribution of candidate rules. Rules in the top-right quadrant with large bubbles represent ideal recommendation targets.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="support"
                  name="Support (%)"
                  unit="%"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Support (%)', position: 'bottom', fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="confidence"
                  name="Confidence (%)"
                  unit="%"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Confidence (%)', angle: -90, position: 'left', fill: '#64748b', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="lift" range={[40, 280]} name="Lift" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`${val}`, name]}
                />
                <Scatter name="Rules" data={scatterData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rule Network Graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950 text-purple-400 border border-purple-800 mb-1">
              Network Topology
            </div>
            <h2 className="text-base font-semibold text-white flex items-center">
              <Share2 className="w-4 h-4 text-purple-400 mr-2" /> Product Association Network
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-2">
              Visualizes topological clusters between products. Nodes represent products; directional links denote mined co-purchases.
            </p>
          </div>

          <div className="w-full h-72 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
            <svg width={width} height={height} className="max-w-full max-h-full">
              {/* Edges */}
              {edges.map((e, idx) => {
                const p1 = nodePositions.get(e.source);
                const p2 = nodePositions.get(e.target);
                if (!p1 || !p2) return null;
                const strokeWidth = Math.min(Math.max((e.lift / 15), 1), 3);
                return (
                  <line
                    key={idx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#4f46e5"
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.6}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                const pos = nodePositions.get(n.id);
                if (!pos) return null;
                return (
                  <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle r={10} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={2} />
                    <text
                      y={-14}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={9}
                      className="select-none font-semibold"
                    >
                      {n.label.substring(0, 12)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

