import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  ArrowLeft,
  GraduationCap,
  Menu,
  X,
  Database,
  Cpu,
  TrendingUp,
  FileText,
} from 'lucide-react';

import { DashboardPage } from './DashboardPage';
import { PreprocessingPage } from './PreprocessingPage';
import { EdaPage } from './EdaPage';
import { ExplorerPage } from './ExplorerPage';
import { VisualisationsPage } from './VisualisationsPage';
import { ComparisonPage } from './ComparisonPage';
import { SensitivityPage } from './SensitivityPage';
import { RecommenderPage } from './RecommenderPage';
import { EvaluationPage } from './EvaluationPage';
import { InsightsPage } from './InsightsPage';
import { MethodologyPage } from './MethodologyPage';

interface NavGroup {
  group: string;
  items: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Executive Overview',
    items: [
      { id: 'dashboard', label: 'Executive KPIs', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Data Engineering',
    items: [
      { id: 'preprocessing', label: '11-Step Preprocessing', icon: Layers, badge: '16.5k Baskets' },
      { id: 'eda', label: 'Exploratory EDA', icon: BarChart3 },
    ],
  },
  {
    group: 'Mining & Algorithms',
    items: [
      { id: 'explorer', label: 'Mining Explorer', icon: Sliders, badge: '1,865 Rules' },
      { id: 'comparison', label: 'FP-Growth vs Apriori', icon: Scale },
      { id: 'sensitivity', label: 'Sensitivity Analysis', icon: Activity },
    ],
  },
  {
    group: 'Decision Support & ML',
    items: [
      { id: 'recommender', label: 'Recommender Engine', icon: ShoppingBag },
      { id: 'evaluation', label: 'Offline 80/20 Eval', icon: CheckCircle2, badge: 'Holdout' },
      { id: 'insights', label: 'Decision Matrix', icon: Lightbulb },
    ],
  },
  {
    group: 'Academic Verification',
    items: [
      { id: 'visualisations', label: 'Report Figures', icon: LineChart },
      { id: 'methodology', label: 'Methodology & Proofs', icon: BookOpen, badge: 'Proofs' },
    ],
  },
];

export const FacultyStudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSelectTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col font-sans">
      {/* 1. TOP ENTERPRISE HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Faculty Analytics &amp; Evaluation Studio
                </span>
                <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  DMBI CA2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                V.E.S.I.T. Autonomous Institute • Guide: Sukanya Roychowdhury • Team: Gharat (50), Lokhande (55), Nishad (59), Yadav (69)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-500 border-r border-slate-200 pr-4">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Backend Connected: 16,506 UK Baskets</span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT CANVAS */}
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Desktop Sidebar (Left Column) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs sticky top-24 space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                  {group.group}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-5 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Analytics Modules</span>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {NAV_GROUPS.map((group) => (
                <div key={group.group} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                    {group.group}
                  </span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'preprocessing' && <PreprocessingPage />}
          {activeTab === 'eda' && <EdaPage />}
          {activeTab === 'explorer' && <ExplorerPage />}
          {activeTab === 'comparison' && <ComparisonPage />}
          {activeTab === 'sensitivity' && <SensitivityPage />}
          {activeTab === 'recommender' && <RecommenderPage />}
          {activeTab === 'evaluation' && <EvaluationPage />}
          {activeTab === 'insights' && <InsightsPage />}
          {activeTab === 'visualisations' && <VisualisationsPage />}
          {activeTab === 'methodology' && <MethodologyPage />}
        </main>
      </div>
    </div>
  );
};
