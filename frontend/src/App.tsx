import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import { StoreHeader } from './components/store/StoreHeader';
import { StoreFooter } from './components/store/StoreFooter';
import { CartDrawer } from './components/store/CartDrawer';

import { StoreHomePage } from './pages/store/StoreHomePage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { CategoriesPage } from './pages/store/CategoriesPage';
import { CartPage } from './pages/store/CartPage';
import { FacultyStudioPage } from './pages/FacultyStudioPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFBFB] text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <StoreHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Main E-Commerce Application Routes */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<StoreHomePage />} />
              <Route path="/product/:code" element={<ProductDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/store" element={<StoreHomePage />} />
              <Route path="/amazon" element={<StoreHomePage />} />
            </Route>

            {/* 2. Isolated Faculty Analytics Studio (Academic / Evaluation Only) */}
            <Route path="/analytics" element={<FacultyStudioPage />} />

            {/* 3. Redirect legacy academic routes to the isolated Faculty Studio with active tab */}
            <Route path="/dashboard" element={<Navigate to="/analytics?tab=dashboard" replace />} />
            <Route path="/preprocessing" element={<Navigate to="/analytics?tab=preprocessing" replace />} />
            <Route path="/eda" element={<Navigate to="/analytics?tab=eda" replace />} />
            <Route path="/explorer" element={<Navigate to="/analytics?tab=explorer" replace />} />
            <Route path="/visualisations" element={<Navigate to="/analytics?tab=visualisations" replace />} />
            <Route path="/comparison" element={<Navigate to="/analytics?tab=comparison" replace />} />
            <Route path="/sensitivity" element={<Navigate to="/analytics?tab=sensitivity" replace />} />
            <Route path="/recommender" element={<Navigate to="/analytics?tab=recommender" replace />} />
            <Route path="/evaluation" element={<Navigate to="/analytics?tab=evaluation" replace />} />
            <Route path="/insights" element={<Navigate to="/analytics?tab=insights" replace />} />
            <Route path="/methodology" element={<Navigate to="/analytics?tab=methodology" replace />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
