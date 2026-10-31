import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';

import { DashboardPage } from './pages/DashboardPage';
import { PreprocessingPage } from './pages/PreprocessingPage';
import { EdaPage } from './pages/EdaPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { VisualisationsPage } from './pages/VisualisationsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { SensitivityPage } from './pages/SensitivityPage';
import { RecommenderPage } from './pages/RecommenderPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { InsightsPage } from './pages/InsightsPage';
import { MethodologyPage } from './pages/MethodologyPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/preprocessing" element={<PreprocessingPage />} />
              <Route path="/eda" element={<EdaPage />} />
              <Route path="/explorer" element={<ExplorerPage />} />
              <Route path="/visualisations" element={<VisualisationsPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/sensitivity" element={<SensitivityPage />} />
              <Route path="/recommender" element={<RecommenderPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
            <p>Data Mining & Business Intelligence (DMBI) Continuous Assessment - 2 • V.E.S.I.T. Autonomous Institute</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Vedant Gharat (50) • Ayush Lokhande (55) • Deepak Nishad (59) • Ayush Yadav (69) • Sem-5 D15B
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
