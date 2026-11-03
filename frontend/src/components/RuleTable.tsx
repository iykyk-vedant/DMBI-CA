import React, { useState } from 'react';
import { AssociationRule } from '../types';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, Tag, CheckCircle2, Info } from 'lucide-react';

interface RuleTableProps {
  rules: AssociationRule[];
  isLoading?: boolean;
}

export const RuleTable: React.FC<RuleTableProps> = ({ rules, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium">Loading association rules...</p>
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-xs">
        No association rules match the selected criteria. Try lowering support or confidence thresholds.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Antecedents (If bought)</th>
              <th className="py-3 px-4">Consequents (Then co-bought)</th>
              <th className="py-3 px-3 text-right">Support</th>
              <th className="py-3 px-3 text-right">Confidence</th>
              <th className="py-3 px-3 text-right">Lift</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rules.map((r) => {
              const isExpanded = expandedId === r.id;

              return (
                <React.Fragment key={r.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="space-y-0.5">
                        {r.antecedents.map((a) => (
                          <div key={a.code} className="truncate max-w-[220px]" title={a.label}>
                            <span className="text-blue-600 font-mono text-[11px] mr-1.5 font-bold">[{a.code}]</span>
                            <span className="text-slate-800">{a.label}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="space-y-0.5">
                        {r.consequents.map((c) => (
                          <div key={c.code} className="truncate max-w-[220px]" title={c.label}>
                            <span className="text-emerald-700 font-mono text-[11px] mr-1.5 font-bold">[{c.code}]</span>
                            <span className="text-slate-800">{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                      {(r.support * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                      {(r.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                      {r.lift.toFixed(2)}x
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.rule_type === 'complementary'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r.rule_type === 'complementary' ? 'Cross-Category' : 'Color Variant'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.actionable ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Actionable
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Redundant
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>

                  {/* Expanded Analytical Details */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200/80">
                      <td colSpan={8} className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Metric Summary
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>Antecedent Supp: <strong className="text-slate-900 font-mono">{(r.antecedent_support * 100).toFixed(2)}%</strong></div>
                              <div>Consequent Supp: <strong className="text-slate-900 font-mono">{(r.consequent_support * 100).toFixed(2)}%</strong></div>
                              <div>Leverage: <strong className="text-slate-900 font-mono">{(r.leverage ?? 0).toFixed(4)}</strong></div>
                              <div>Conviction: <strong className="text-slate-900 font-mono">{(r.conviction ?? 0).toFixed(2)}</strong></div>
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Merchandising Classification
                            </span>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {r.rule_type === 'complementary'
                                ? 'Complementary pairing: Items originate from distinct functional categories. Recommended for digital cross-selling widgets.'
                                : 'Variant pairing: Items share root product name differing by color or design motif. Recommended for product carousel variations.'}
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Academic Proof & Verification
                            </span>
                            <div className="text-[11px] text-slate-600 space-y-1">
                              <div>Formula: <code>Lift = Conf(A→C) / Supp(C)</code></div>
                              <div>Observed: <strong className="text-blue-700 font-mono">{r.lift.toFixed(2)}x</strong> over independent chance</div>
                              <div className="text-[10px] text-slate-500">Evaluated on N = 16,506 multi-item UK transactions.</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
