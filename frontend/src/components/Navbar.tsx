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
  ShoppingCart,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/store', label: '🛒 Amazon Store Demo', icon: ShoppingCart, highlight: true },
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

          <div className="flex items-center space-x-3">
            <Link
              to="/store"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition-all border border-emerald-400/30"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Amazon Store Demo</span>
              <span className="bg-emerald-950/80 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                LIVE
              </span>
            </Link>

            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              16,506 Baskets
            </span>
          </div>
        </div>

        {/* Scrollable Subnav */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isHighlight = 'highlight' in item && item.highlight;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isHighlight
                    ? isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/30'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 font-semibold'
                    : isActive
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

