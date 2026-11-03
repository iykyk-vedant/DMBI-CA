import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageHeader } from '../components/analytics/PageHeader';
import {
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Package,
  Layers,
} from 'lucide-react';
import { ProductCodeLabel, RecommendationCandidate } from '../types';

export const RecommenderPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProductCodeLabel | null>({
    code: '85099B',
    label: 'JUMBO BAG RED RETROSPOT',
  });
  const [cart, setCart] = useState<ProductCodeLabel[]>([
    { code: '85099B', label: 'JUMBO BAG RED RETROSPOT' },
    { code: '22386', label: 'JUMBO BAG PINK POLKADOT' },
  ]);

  // Product Autocomplete Search
  const { data: searchResults } = useQuery({
    queryKey: ['products-search', searchQuery],
    queryFn: () => api.searchProducts(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });

  // Single Product Recommendation Query
  const { data: singleRecs, isLoading: singleLoading } = useQuery({
    queryKey: ['recommend-single', selectedProduct?.code],
    queryFn: () => (selectedProduct ? api.recommendProduct(selectedProduct.code, 5) : null),
    enabled: !!selectedProduct,
  });

  // Multi-Item Cart Simulator Mutation
  const cartMutation = useMutation({
    mutationFn: (codes: string[]) => api.recommendCart(codes, 5),
  });

  // Trigger cart evaluation on change
  React.useEffect(() => {
    if (cart.length > 0) {
      cartMutation.mutate(cart.map((c) => c.code));
    }
  }, [cart]);

  const handleAddToCart = (item: ProductCodeLabel) => {
    if (!cart.some((c) => c.code === item.code)) {
      setCart([...cart, item]);
    }
  };

  const handleRemoveFromCart = (code: string) => {
    setCart(cart.filter((c) => c.code !== code));
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Decision Support Engine"
        badgeColor="blue"
        icon={ShoppingBag}
        title="Product Recommender &amp; Basket Simulator"
        description="Demonstrates how mined association rules translate into real-time on-page cross-selling recommendations and multi-item basket additions."
      />

      {/* 2. DECISION SUPPORT DISCLAIMER BANNER */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex items-start space-x-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold text-amber-950">Methodological Decision Boundary (CA1 §2.4):</strong> Candidate suggestions generated below represent algorithmic associations discovered from historical retail co-purchases. Before live marketing rollout, all cross-selling bundles should be validated through randomized controlled A/B experiments.
        </div>
      </div>

      {/* 3. PRODUCT AUTOCOMPLETE SEARCH BAR */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Search Product Catalog for Real-Time Analysis</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Type product name or stock code (e.g. CAKESTAND, JUMBO BAG, 85099B, HEART)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          {searchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30 divide-y divide-slate-100">
              {searchResults.map((p) => (
                <div
                  key={p.code}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSearchQuery('');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="text-slate-800 truncate pr-2">
                    <span className="font-mono text-blue-600 font-bold mr-1.5">[{p.code}]</span>
                    {p.label}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                      setSearchQuery('');
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. TWO COLUMN: SINGLE PDP RECOMMENDER VS MULTI-ITEM CART SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Product Recommender */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Product Detail Page View
                </span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedProduct ? (
                    <span title={selectedProduct.label}>
                      <span className="font-mono text-blue-600 mr-1.5">[{selectedProduct.code}]</span>
                      {selectedProduct.label}
                    </span>
                  ) : (
                    'Select a product...'
                  )}
                </div>
              </div>
              {selectedProduct && (
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Add to Cart</span>
                </button>
              )}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              <span>Customers Who Bought This Also Bought (Anchor Rules)</span>
            </h3>

            {singleLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Searching association rules...</div>
            ) : singleRecs?.recommendations && singleRecs.recommendations.length > 0 ? (
              <div className="space-y-3">
                {singleRecs.recommendations.map((rec) => (
                  <div
                    key={rec.code}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">
                        <span className="font-mono text-blue-600 mr-1">[{rec.code}]</span>
                        {rec.label}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{rec.explanation}</p>
                      <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                          Lift: {rec.lift.toFixed(1)}x
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          Conf: {(rec.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="text-slate-500 capitalize">{rec.rule_type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart({ code: rec.code, label: rec.label })}
                      className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                {singleRecs?.reason ?? 'No matching rules for this product.'}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Item Cart Simulator */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Shopping Cart Simulator ({cart.length} items)
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Active Cart Items */}
            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Your cart is empty. Add products above to test multi-item cross-sell rules.
              </div>
            ) : (
              <div className="space-y-1.5 mb-6 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.code}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2 text-slate-800">
                      <span className="font-mono text-blue-600 font-bold mr-1.5">[{item.code}]</span>
                      {item.label}
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.code)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Multi-Item Contextual Suggestions */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              <span>Multi-Item Checkout Cross-Sell Suggestions</span>
            </h3>

            {cartMutation.isPending ? (
              <div className="py-6 text-center text-xs text-slate-400">Evaluating multi-item antecedents...</div>
            ) : cartMutation.data?.recommendations && cartMutation.data.recommendations.length > 0 ? (
              <div className="space-y-3">
                {cartMutation.data.recommendations.map((rec) => (
                  <div
                    key={rec.code}
                    className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">
                        <span className="font-mono text-emerald-700 mr-1">[{rec.code}]</span>
                        {rec.label}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{rec.explanation}</p>
                      <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                          Lift: {rec.lift.toFixed(1)}x
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          Conf: {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart({ code: rec.code, label: rec.label })}
                      className="shrink-0 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                {cart.length > 0
                  ? cartMutation.data?.reason ?? 'No multi-item rules match this exact combination.'
                  : 'Add items above to see multi-item recommendations.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
