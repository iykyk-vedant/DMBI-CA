import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AlertCircle, Calendar, Package, Globe, Info } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const EdaPage: React.FC = () => {
  const { data: eda, isLoading } = useQuery({ queryKey: ['eda'], queryFn: api.getEda });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading exploratory data analysis...</p>
      </div>
    );
  }

  const topProducts = eda?.top_products ?? [];
  const monthly = eda?.monthly_trend ?? [];
  const basketSizes = eda?.basket_sizes;
  const countryShare = eda?.country_share ?? [];
  const outliers = eda?.raw_outliers;

  // Format top products for horizontal bar chart
  const topProductsChartData = topProducts.map((p) => ({
    name: p.label.length > 25 ? p.label.substring(0, 25) + '...' : p.label,
    fullName: p.label,
    code: p.stock_code,
    invoices: p.invoice_count,
    share: p.share_of_baskets_pct,
  })).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Exploratory Data Analysis (EDA)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Empirical retail patterns, seasonal seasonality, and data characteristics supporting the mining scope.
        </p>
      </div>

      {/* CA1 Viz #1: Top 10 Products by Valid UK Invoices */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-400 border border-blue-800 mb-1">
              CA1 Visualisation #1
            </div>
            <h2 className="text-base font-semibold text-white">Top 10 Products by Valid UK Invoices</h2>
          </div>
          <span className="text-xs text-slate-400">Total Baskets: 16,506</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Captures product prevalence across unique transaction baskets. WHITE HANGING HEART T-LIGHT HOLDER and JUMBO BAG RED RETROSPOT dominate co-purchase anchor points.
        </p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topProductsChartData} margin={{ top: 10, right: 30, left: 160, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, _name: any, item: any) => [
                  `${Number(val).toLocaleString()} baskets (${item.payload.share}%)`,
                  `[${item.payload.code}] ${item.payload.fullName}`,
                ]}
              />
              <Bar dataKey="invoices" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Monthly Trend & Basket Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white flex items-center">
              <Calendar className="w-4 h-4 text-blue-400 mr-2" /> Monthly Transaction Trend
            </h2>
            <span className="text-[11px] text-amber-400 font-medium">Dec 2011 is Partial</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Transaction volume surges in Q4 (October–November) representing wholesale holiday and Christmas giftware procurement.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} invoices (${item.payload.note})`,
                    item.payload.month,
                  ]}
                />
                <Bar dataKey="invoice_count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {monthly.map((entry) => (
                    <Cell key={entry.month} fill={entry.is_partial ? '#f43f5e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Basket Size Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white flex items-center">
              <Package className="w-4 h-4 text-emerald-400 mr-2" /> Basket Size Distribution
            </h2>
            <span className="text-xs text-slate-400">Mean: {basketSizes?.stats.mean} items</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Skewed distribution with heavy right tail: median basket size is {basketSizes?.stats.median} items, reflecting wholesale repeat batch purchases.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={basketSizes?.histogram ?? []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bin" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} baskets`, 'Frequency']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Share & Cleaning Justification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Share */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-2 flex items-center">
            <Globe className="w-4 h-4 text-purple-400 mr-2" /> Market Geographic Distribution
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Empirically justifies restricting analysis scope to the United Kingdom, which accounts for over 90% of total transactions.
          </p>

          <div className="h-56 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryShare}
                  dataKey="records"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ country, share_pct }: any) => `${country} (${share_pct}%)`}
                  labelLine={false}
                >
                  {countryShare.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} records`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outlier Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 text-amber-400 mr-2" /> Raw Distribution Outlier Audit
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Demonstrates why negative and zero filters in Step 4 were essential for data integrity.
          </p>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-slate-200 block mb-1">Quantity Anomalies</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono">
                <div>Min: {outliers?.quantity.min} (Return/Debt)</div>
                <div>Max: {outliers?.quantity.max?.toLocaleString()}</div>
                <div className="text-rose-400">Negative Rows: {outliers?.quantity.negative_count?.toLocaleString()}</div>
                <div>Zero Quantity: {outliers?.quantity.zero_count}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-slate-200 block mb-1">UnitPrice Anomalies</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono">
                <div>Min: £{outliers?.unit_price.min}</div>
                <div>Max: £{outliers?.unit_price.max?.toLocaleString()}</div>
                <div className="text-rose-400">Zero/Negative: {outliers?.unit_price.zero_count?.toLocaleString()}</div>
                <div>High Outliers (&gt;£500): {outliers?.unit_price.extreme_high_count_gt_500}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
