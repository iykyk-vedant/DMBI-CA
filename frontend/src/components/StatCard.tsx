import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'blue',
}) => {
  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-center text-blue-600">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-500 pt-1.5 border-t border-slate-100">{subtitle}</p>}
    </div>
  );
};
