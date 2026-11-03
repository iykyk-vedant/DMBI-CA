import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageHeader } from '../components/analytics/PageHeader';
import { ChartCard } from '../components/analytics/ChartCard';
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
import { Calendar, Package, Globe, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

const PIE_COLORS = ['#2563EB', '#059669', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const EdaPage: React.FC = () => {
  const { data: eda, isLoading } = useQuery({ queryKey: ['eda'], queryFn: api.getEda });

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-12 text-center text-slate-500 shadow-xs">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold">Loading exploratory data analysis...</p>
      </div>
    );
  }

  const topProducts = eda?.top_products ?? [];
  const monthly = eda?.monthly_trend ?? [];
  const basketSizes = eda?.basket_sizes;
  const countryShare = eda?.country_share ?? [];
  const outliers = eda?.raw_outliers;

  // Format top products for horizontal bar chart
  const topProductsChartData = topProducts
    .map((p) => ({
      name: p.label.length > 28 ? p.label.substring(0, 28) + '...' : p.label,
      fullName: p.label,
      code: p.stock_code,
      invoices: p.invoice_count,
      share: p.share_of_baskets_pct,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Exploratory Data Analysis"
        badgeColor="blue"
        icon={BarChart3}
        title="Exploratory Retail Pattern Analysis"
        description="Empirical distribution patterns, transaction seasonality, basket sizes, and geographic concentration supporting the mining scope."
      />

      {/* 2. CA1 VIZ #1: TOP 10 PRODUCTS BY VALID UK INVOICES */}
      <ChartCard
        title="CA1 Viz #1: Top 10 Products by Valid UK Invoices"
        subtitle="Captures item prevalence across unique transaction baskets. WHITE HANGING HEART and JUMBO BAG RED RETROSPOT dominate co-purchase anchor points."
        badge="16,506 Baskets"
        heightClass="h-84"
        footer="Prevalence dictates anchor itemset selection. Items with high single-item support serve as high-probability antecedents in rule derivation."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={topProductsChartData} margin={{ top: 10, right: 30, left: 170, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} stroke="#CBD5E1" />
            <YAxis dataKey="name" type="category" tick={{ fill: '#1E293B', fontSize: 11 }} stroke="#CBD5E1" width={160} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                color: '#172033',
              }}
              formatter={(val: any, _name: any, item: any) => [
                `${Number(val).toLocaleString()} baskets (${item.payload.share}%)`,
                `[${item.payload.code}] ${item.payload.fullName}`,
              ]}
            />
            <Bar dataKey="invoices" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. GRID: MONTHLY VOLUME & BASKET SIZE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume */}
        <ChartCard
          title="Monthly Transaction Trend"
          subtitle="Transaction volume surges in Q4 (October–November) representing wholesale holiday and Christmas procurement."
          icon={Calendar}
          badge="Q4 Holiday Peak"
          heightClass="h-64"
          footer="December 2011 represents only the first 9 calendar days before dataset cut-off (marked in Amber)."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} angle={-30} textAnchor="end" stroke="#CBD5E1" />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  color: '#172033',
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val} invoices (${item.payload.note})`,
                  item.payload.month,
                ]}
              />
              <Bar dataKey="invoice_count" fill="#2563EB" radius={[4, 4, 0, 0]}>
                {monthly.map((entry) => (
                  <Cell key={entry.month} fill={entry.is_partial ? '#D97706' : '#2563EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Basket Size Distribution */}
        <ChartCard
          title="Basket Size Distribution"
          subtitle={`Skewed distribution with heavy right tail: mean is ${basketSizes?.stats.mean} items, median is ${basketSizes?.stats.median} items.`}
          icon={Package}
          badge={`Mean: ${basketSizes?.stats.mean ?? 28.6}`}
          heightClass="h-64"
          footer="Wholesale buyers purchase large diverse batches, creating rich combinatorial co-occurrences."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basketSizes?.histogram ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="bin" tick={{ fill: '#64748B', fontSize: 11 }} stroke="#CBD5E1" />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  color: '#172033',
                }}
                formatter={(val: any) => [`${val} baskets`, 'Frequency']}
              />
              <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 4. GEOGRAPHIC DISTRIBUTION & OUTLIER AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Share */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Market Geographic Distribution</h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                UK &gt; 90%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Empirically justifies restricting mining scope to the United Kingdom, which accounts for over 90% of total commercial transactions.
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryShare}
                    dataKey="records"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ country, share_pct }: any) => `${country} (${share_pct}%)`}
                    labelLine={false}
                  >
                    {countryShare.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      color: '#172033',
                    }}
                    formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} records`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Export markets (Germany, France, EIRE) have heterogeneous shipping patterns and are isolated from the domestic retail basket model.
          </div>
        </div>

        {/* Outlier Audit */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Raw Distribution Outlier Audit</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Step 4 Validation
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Empirical audit demonstrating why negative quantities (returns/damages) and zero-price rows were rigorously filtered out in Step 4.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-2">Quantity Anomalies (Returns &amp; Stock Adjustments)</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono">
                  <div>Min: <span className="font-bold text-rose-600">{outliers?.quantity.min}</span> (Cancellations)</div>
                  <div>Max: <span className="font-bold text-slate-900">{outliers?.quantity.max?.toLocaleString()}</span></div>
                  <div>Negative Rows: <span className="font-bold text-rose-600">{outliers?.quantity.negative_count?.toLocaleString()}</span></div>
                  <div>Zero Quantity: <span className="font-bold text-slate-700">{outliers?.quantity.zero_count}</span></div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-2">UnitPrice Anomalies (Debts, Postage &amp; Freebies)</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono">
                  <div>Min: <span className="font-bold text-rose-600">£{outliers?.unit_price.min}</span></div>
                  <div>Max: <span className="font-bold text-slate-900">£{outliers?.unit_price.max?.toLocaleString()}</span></div>
                  <div>Zero/Negative: <span className="font-bold text-rose-600">{outliers?.unit_price.zero_count?.toLocaleString()}</span></div>
                  <div>Extreme Outliers (&gt;£500): <span className="font-bold text-amber-700">{outliers?.unit_price.extreme_high_count_gt_500}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Removing negative and zero transactions preserves true consumer co-purchase affinities without distortion from credit reversals.
          </div>
        </div>
      </div>
    </div>
  );
};
