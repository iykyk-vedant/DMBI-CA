import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Tag,
  ShieldAlert,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Product Recommender & Cart Simulator</h1>
        <p className="text-sm text-slate-400 mt-1">
          Demonstrates how mined association rules power real-time on-page cross-selling and multi-item basket add-ons.
        </p>
      </div>

      {/* Decision Support Disclaimer Banner */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-semibold text-amber-300">Methodological Decision Boundary:</strong> Recommendations generated below represent candidate suggestions for randomized controlled testing (A/B testing). Historical association mining demonstrates co-purchase affinity but does not prove causation or guaranteed AOV uplift.
        </div>
      </div>

      {/* Product Autocomplete Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-2 flex items-center">
          <Search className="w-4 h-4 text-blue-400 mr-2" /> Search Catalog for Product Recommendations
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Type product name or stock code (e.g. CAKESTAND, JUMBO BAG, 85123A)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          {searchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30 divide-y divide-slate-800">
              {searchResults.map((p) => (
                <div
                  key={p.code}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSearchQuery('');
                  }}
                  className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="text-slate-200 truncate pr-2">
                    <span className="font-mono text-blue-400 mr-1.5">[{p.code}]</span>
                    {p.label}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                      setSearchQuery('');
                    }}
                    className="shrink-0 px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white text-[10px] font-medium"
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Single Product Recommender vs Multi-Item Cart Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Product Recommender */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Product Detail Page View
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedProduct ? (
                    <span title={selectedProduct.label}>
                      <span className="font-mono text-blue-400 mr-1.5">[{selectedProduct.code}]</span>
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
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Add to Cart</span>
                </button>
              )}
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Customers Who Bought This Also Bought
            </h3>

            {singleLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">Searching association rules...</div>
            ) : singleRecs?.recommendations && singleRecs.recommendations.length > 0 ? (
              <div className="space-y-3">
                {singleRecs.recommendations.map((rec) => (
                  <div
                    key={rec.code}
                    className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">
                        <span className="font-mono text-emerald-400 mr-1">[{rec.code}]</span>
                        {rec.label}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{rec.explanation}</p>
                      <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                          Lift: {rec.lift.toFixed(1)}x
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                          Conf: {(rec.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="text-slate-500 capitalize">{rec.rule_type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart({ code: rec.code, label: rec.label })}
                      className="shrink-0 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                {singleRecs?.reason ?? 'No matching rules for this product.'}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Item Cart Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Shopping Cart Simulator ({cart.length} items)</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Active Cart Items */}
            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                Your cart is empty. Add products from search or recommendations to simulate multi-item rules.
              </div>
            ) : (
              <div className="space-y-1.5 mb-6 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.code}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2 text-slate-200">
                      <span className="font-mono text-blue-400 mr-1.5">[{item.code}]</span>
                      {item.label}
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.code)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Multi-Item Contextual Suggestions */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Basket Checkout Suggestions
            </h3>

            {cartMutation.isPending ? (
              <div className="py-6 text-center text-xs text-slate-500">Evaluating multi-item antecedents...</div>
            ) : cartMutation.data?.recommendations && cartMutation.data.recommendations.length > 0 ? (
              <div className="space-y-3">
                {cartMutation.data.recommendations.map((rec) => (
                  <div
                    key={rec.code}
                    className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">
                        <span className="font-mono text-emerald-400 mr-1">[{rec.code}]</span>
                        {rec.label}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{rec.explanation}</p>
                      <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                          Lift: {rec.lift.toFixed(1)}x
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                          Conf: {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart({ code: rec.code, label: rec.label })}
                      className="shrink-0 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                {cart.length > 0 ? cartMutation.data?.reason ?? 'No multi-item rules match this combination.' : 'Add items above to see recommendations.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

