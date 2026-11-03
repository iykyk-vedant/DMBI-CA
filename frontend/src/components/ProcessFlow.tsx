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
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 overflow-x-auto scrollbar-none shadow-xs">
      <div className="flex items-center min-w-max space-x-2">
        {STAGES.map((s, idx) => {
          const isCurrent = currentStage === s.id;
          const isDone = currentStage && currentStage > s.id;

          return (
            <React.Fragment key={s.id}>
              <div
                className={`flex flex-col px-3 py-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200/70 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.id}
                  </span>
                  <span className="text-xs font-semibold">{s.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{s.desc}</span>
              </div>
              {idx < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
