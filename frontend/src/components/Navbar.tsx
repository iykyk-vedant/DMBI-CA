import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Sliders,
  LineChart,
  Scale,
  Activity,
  ShoppingBag,
  CheckCircle2,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/preprocessing', label: 'Preprocessing', icon: Layers },
  { path: '/eda', label: 'EDA', icon: BarChart3 },
  { path: '/explorer', label: 'Mining Explorer', icon: Sliders },
  { path: '/visualisations', label: 'Visualisations', icon: LineChart },
  { path: '/comparison', label: 'Algorithm Comparison', icon: Scale },
  { path: '/sensitivity', label: 'Sensitivity', icon: Activity },
  { path: '/recommender', label: 'Recommender & Cart', icon: ShoppingBag },
  { path: '/evaluation', label: 'Evaluation & Impact', icon: CheckCircle2 },
  { path: '/insights', label: 'Business Insights', icon: Lightbulb },
  { path: '/methodology', label: 'Methodology', icon: BookOpen },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              CA2
            </div>
            <div>
              <Link to="/" className="text-base font-semibold text-white hover:text-blue-400 transition-colors">
                Market Basket Analysis
              </Link>
              <div className="text-xs text-slate-400 hidden sm:block">
                DMBI Case Study • V.E.S.I.T. Sem-5 D15B • Team Gharat, Lokhande, Nishad, Yadav
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Live Pipeline
            </span>
          </div>
        </div>

        {/* Scrollable Subnav */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

