import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface FormulaBlockProps {
  title: string;
  formula: string;
  description: string;
  variables?: Array<{ name: string; definition: string }>;
  example?: string;
  unitTestStatus?: string;
}

export const FormulaBlock: React.FC<FormulaBlockProps> = ({
  title,
  formula,
  description,
  variables,
  example,
  unitTestStatus,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
        {unitTestStatus && (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{unitTestStatus}</span>
          </span>
        )}
      </div>

      {/* Formula Display Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center font-mono text-xs sm:text-sm font-bold text-slate-900 overflow-x-auto">
        {formula}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        {description}
      </p>

      {variables && variables.length > 0 && (
        <div className="bg-slate-50/60 rounded-lg p-3 border border-slate-100 space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Component Definitions:
          </span>
          {variables.map((v) => (
            <div key={v.name} className="flex items-start space-x-2 text-[11px] text-slate-600">
              <span className="font-mono font-bold text-slate-800 shrink-0 w-24">{v.name}:</span>
              <span>{v.definition}</span>
            </div>
          ))}
        </div>
      )}

      {example && (
        <div className="text-[11px] text-slate-500 bg-blue-50/50 border border-blue-100/70 p-2.5 rounded-lg">
          <strong className="text-blue-900">Worked Calculation:</strong> {example}
        </div>
      )}
    </div>
  );
};
