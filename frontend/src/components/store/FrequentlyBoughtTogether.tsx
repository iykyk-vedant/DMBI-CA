import React, { useState, useEffect } from 'react';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductDetail, getProductMeta } from '../../data/products';
import { RecommendationCandidate } from '../../types';

interface FrequentlyBoughtTogetherProps {
  currentProduct: ProductDetail;
  recommendations: RecommendationCandidate[];
  isLoading?: boolean;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  currentProduct,
  recommendations,
  isLoading,
}) => {
  const { addBundleToCart } = useCart();

  // Top 2 complementary recommendations
  const topRecommendations = recommendations.slice(0, 2).map((rec) => getProductMeta(rec.code, rec.label));

  // Bundle state of checked items
  const [checkedState, setCheckedState] = useState<{ [code: string]: boolean }>({
    [currentProduct.code]: true,
  });

  useEffect(() => {
    const nextState: { [code: string]: boolean } = { [currentProduct.code]: true };
    topRecommendations.forEach((item) => {
      nextState[item.code] = true;
    });
    setCheckedState(nextState);
  }, [currentProduct.code, recommendations.length]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-100 rounded w-48" />
        <div className="h-20 bg-slate-50 rounded-xl" />
      </div>
    );
  }

  if (topRecommendations.length === 0) {
    return null;
  }

  const allBundleItems = [currentProduct, ...topRecommendations];

  // Calculate live bundle price based on checked items
  const selectedItems = allBundleItems.filter((item) => checkedState[item.code]);
  const bundleTotal = Number(
    selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)
  );

  const handleToggle = (code: string) => {
    setCheckedState((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const handleAddBundle = () => {
    if (selectedItems.length === 0) return;
    addBundleToCart(
      selectedItems.map((item) => ({
        code: item.code,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        category: item.category,
      }))
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Frequently Bought Together
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers who viewed this item frequently purchase these complementary items together.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
          ✓ Popular Complementary Pairing
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left / Center: Interactive Bundle Item Row */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
          {allBundleItems.map((item, idx) => {
            const isChecked = !!checkedState[item.code];
            const isPrimary = idx === 0;

            return (
              <React.Fragment key={item.code}>
                {idx > 0 && (
                  <span className="text-xl font-bold text-slate-300 px-0.5">+</span>
                )}

                <div
                  className={`bg-slate-50/80 border rounded-xl p-3 flex items-center space-x-3 transition-all ${
                    isChecked
                      ? 'border-emerald-300 ring-2 ring-emerald-100/60 bg-emerald-50/20'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`bundle-chk-${item.code}`}
                    checked={isChecked}
                    onChange={() => handleToggle(item.code)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg bg-white border border-slate-100 shrink-0"
                  />

                  <div className="max-w-[170px]">
                    <label
                      htmlFor={`bundle-chk-${item.code}`}
                      className="text-xs font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-emerald-800 block"
                    >
                      {item.name}
                    </label>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5">
                      £{item.price.toFixed(2)}
                    </div>
                    {isPrimary && (
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">
                        This item
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Bundle Price & 1-Click CTA */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
          <div>
            <span className="text-xs text-slate-500">
              Total price for {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}:
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              £{bundleTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Save with combined dispatch & shipping
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            disabled={selectedItems.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Selected ({selectedItems.length}) to Bag</span>
          </button>
        </div>
      </div>
    </section>
  );
};

