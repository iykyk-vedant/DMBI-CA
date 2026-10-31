import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ProcessFlowProps {
  currentStage?: number;
}

const STAGES = [
  { id: 1, name: 'Problem', desc: 'Cross-selling & discovery' },
  { id: 2, name: 'Data', desc: 'UCI Online Retail' },
  { id: 3, name: 'Preprocessing', desc: '11-step cleaning & UK scope' },
  { id: 4, name: 'Algorithm', desc: 'FP-Growth & Apriori' },
  { id: 5, name: 'Results', desc: 'Frequent sets & rules' },
  { id: 6, name: 'Evaluation', desc: 'Support, Confidence, Lift' },
  { id: 7, name: 'Insights', desc: 'Themes & actionability' },
  { id: 8, name: 'Decision', desc: 'Recommender & A/B testing' },
];

export const ProcessFlow: React.FC<ProcessFlowProps> = ({ currentStage }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max space-x-2">
        {STAGES.map((s, idx) => {
          const isCurrent = currentStage === s.id;
          const isDone = currentStage && currentStage > s.id;

          return (
            <React.Fragment key={s.id}>
              <div
                className={`flex flex-col px-3 py-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 shadow-md shadow-blue-500/10'
                    : isDone
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {s.id}
                  </span>
                  <span className="text-xs font-semibold">{s.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{s.desc}</span>
              </div>
              {idx < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

