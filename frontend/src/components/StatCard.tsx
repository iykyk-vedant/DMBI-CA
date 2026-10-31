import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple';
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
    blue: 'bg-blue-950 text-blue-400 border-blue-800',
    emerald: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    amber: 'bg-amber-950 text-amber-400 border-amber-800',
    purple: 'bg-purple-950 text-purple-400 border-purple-800',
  }[badgeColor];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <Icon className="w-4 h-4 text-blue-400" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {badge && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

