import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

export const FacultyStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Executive KPIs', icon: LayoutDashboard },
    { id: 'preprocessing', label: '11-Step Preprocessing', icon: Layers },
    { id: 'eda', label: 'Exploratory EDA', icon: BarChart3 },
    { id: 'explorer', label: 'Mining Explorer', icon: Sliders },
    { id: 'comparison', label: 'FP-Growth vs Apriori', icon: Scale },
    { id: 'sensitivity', label: 'Sensitivity Grid', icon: Activity },
    { id: 'recommender', label: 'Recommender Matrix', icon: ShoppingBag },
    { id: 'evaluation', label: 'Offline 80/20 Eval', icon: CheckCircle2 },
    { id: 'insights', label: 'Decision Matrix', icon: Lightbulb },
    { id: 'visualisations', label: 'Report Figures', icon: LineChart },
    { id: 'methodology', label: 'Methodology Proofs', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="max-w-7xl mx-auto w-full border-b border-slate-800 pb-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Faculty Analytics & Evaluation Studio</h1>
                <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-700/60">
                  DMBI CA2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                V.E.S.I.T. D15B Sem-5 • Guide: Sukanya Roychowdhury • Team: Gharat, Lokhande, Nishad, Yadav
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to E-Commerce Storefront</span>
          </Link>
        </div>

        {/* Studio Subnav Tabs */}
        <div className="flex space-x-1 overflow-x-auto pt-5 scrollbar-none text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto w-full flex-1">
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
      </div>
    </div>
  );
};
