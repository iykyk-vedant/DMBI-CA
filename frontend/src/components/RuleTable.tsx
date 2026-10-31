import React, { useState } from 'react';
import { AssociationRule } from '../types';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, Tag, CheckCircle } from 'lucide-react';

interface RuleTableProps {
  rules: AssociationRule[];
  isLoading?: boolean;
}

export const RuleTable: React.FC<RuleTableProps> = ({ rules, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading association rules...</p>
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        No association rules match the selected criteria.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Antecedents (If bought)</th>
              <th className="py-3 px-4">Consequents (Then also)</th>
              <th className="py-3 px-3 text-right">Support</th>
              <th className="py-3 px-3 text-right">Confidence</th>
              <th className="py-3 px-3 text-right">Lift</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-3 text-center">Actionable</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rules.map((r) => {
              const isExpanded = expandedId === r.id;

              return (
                <React.Fragment key={r.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div className="space-y-0.5">
                        {r.antecedents.map((a) => (
                          <div key={a.code} className="truncate max-w-[220px]" title={a.label}>
                            <span className="text-blue-400 font-mono text-[11px] mr-1">[{a.code}]</span>
                            {a.label}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div className="space-y-0.5">
                        {r.consequents.map((c) => (
                          <div key={c.code} className="truncate max-w-[220px]" title={c.label}>
                            <span className="text-emerald-400 font-mono text-[11px] mr-1">[{c.code}]</span>
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {(r.support * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300 font-semibold">
                      {(r.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-400 font-bold">
                      {r.lift.toFixed(2)}x
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                          r.rule_type === 'variant'
                            ? 'bg-purple-950/60 text-purple-400 border-purple-800'
                            : 'bg-blue-950/60 text-blue-400 border-blue-800'
                        }`}
                      >
                        {r.rule_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.actionable ? (
                        <span className="inline-flex items-center text-emerald-400 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-500 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-950/60">
                      <td colSpan={8} className="p-4 border-t border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium block mb-1">Additional Metrics:</span>
                            <div className="space-y-1 font-mono text-slate-300">
                              <div>Antecedent Support: {(r.antecedent_support * 100).toFixed(2)}%</div>
                              <div>Consequent Support: {(r.consequent_support * 100).toFixed(2)}%</div>
                              <div>Leverage: {r.leverage ? r.leverage.toFixed(4) : 'N/A'}</div>
                              <div>Conviction: {r.conviction ? r.conviction.toFixed(2) : 'N/A'}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block mb-1">Commercial Evaluation:</span>
                            <div className="text-slate-300 leading-relaxed">
                              {r.reason}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block mb-1">Decision Recommendation:</span>
                            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {r.actionable ? (
                                <span className="text-emerald-300 flex items-start">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0 mt-0.5" />
                                  Suitable for cross-sell add-on or checkout recommendation carousel.
                                </span>
                              ) : (
                                <span className="text-amber-300 flex items-start">
                                  <Tag className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0 mt-0.5" />
                                  Review margin and product relationship before bundling.
                                </span>
                              )}
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

