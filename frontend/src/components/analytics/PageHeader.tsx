import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate';
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge = 'DMBI CA2 Research',
  badgeColor = 'blue',
  title,
  description,
  icon: Icon,
  actions,
}) => {
  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};
