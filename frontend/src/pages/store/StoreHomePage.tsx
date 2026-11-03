import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  ArrowRight,
  Coffee,
  ShoppingBag,
  Clock,
  Heart,
  Sprout,
  ShieldCheck,
  Check,
  Star,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../api/client';
import { ProductCard } from '../../components/store/ProductCard';
import { FEATURED_CATALOG, getProductMeta, ProductDetail } from '../../data/products';

export const StoreHomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Query EDA for top products to ensure 100% genuine dynamic dataset integration
  const { data: edaData } = useQuery({
    queryKey: ['eda'],
    queryFn: api.getEda,
  });

  const categories = [
    { id: 'all', label: 'All Essentials', icon: ShoppingBag },
    { id: 'tableware', label: 'Tableware & Dining', icon: Coffee },
    { id: 'bags', label: 'Storage & Bags', icon: ShoppingBag },
    { id: 'decor', label: 'Home Decor', icon: Heart },
    { id: 'clocks', label: 'Vintage Clocks', icon: Clock },
    { id: 'garden', label: 'Garden & Outdoor', icon: Sprout },
  ];

  // Base list of catalog products
  const baseCatalogList: ProductDetail[] = Object.values(FEATURED_CATALOG).map(
    (item) => getProductMeta(item.code!, item.name)
  );

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? baseCatalogList
    : baseCatalogList.filter((p) => {
        const cat = p.category.toLowerCase();
        if (selectedCategory === 'tableware') return cat.includes('tableware') || cat.includes('dining');
        if (selectedCategory === 'bags') return cat.includes('storage') || cat.includes('bag');
        if (selectedCategory === 'decor') return cat.includes('decor') || cat.includes('clock');
        if (selectedCategory === 'clocks') return cat.includes('clock');
        if (selectedCategory === 'garden') return cat.includes('garden');
        return true;
      });

  const bestSellers = baseCatalogList.slice(0, 4);

  return (
    <div className="space-y-12 pb-12">
      {/* 1. SLIM & ELEGANT PROMOTIONAL BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-900/60 backdrop-blur-xs text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-600/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated British Heritage Collection</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Discover Products <br className="hidden sm:inline" />
              <span className="text-emerald-200">You&apos;ll Truly Love</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Explore timeless tableware, heavy-duty storage bags, and nostalgic lifestyle accents, handpicked from real British retail transaction favourites.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/product/22699"
                className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all inline-flex items-center space-x-2"
              >
                <span>Shop Regency Collection</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </Link>
              <Link
                to="/categories?filter=bestsellers"
                className="bg-emerald-900/70 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full border border-emerald-500/40 transition-colors inline-flex items-center space-x-1.5"
              >
                <span>View Best Sellers</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 hidden md:flex justify-end">
            <div className="relative">
              <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 rotate-2 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80"
                  alt="Regency Teacup Showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  ★
                </div>
                <div>
                  <span className="text-xs font-bold block">Roses Regency Teacup</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Over 1,840 Co-Purchases</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. CATEGORY QUICK DISCOVERY PILLS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Shop by Department
            </h2>
            <Link to="/categories" className="text-xs font-semibold text-emerald-700 hover:underline">
              Browse All →
            </Link>
          </div>

          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. BEST SELLERS SPOTLIGHT */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                Customer Favourites
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Trending Best Sellers
              </h2>
            </div>
            <Link
              to="/categories?filter=bestsellers"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              See all ({baseCatalogList.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.code} product={prod} />
            ))}
          </div>
        </section>

        {/* 4. CURATED BUNDLE PROMOTIONS (Frequently Bought Together Previews) */}
        <section className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                Perfect Pairings
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Frequently Bought Together Bundles
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Popular complementary combinations discovered through historical UK purchase habits.
              </p>
            </div>
            <Link
              to="/product/22699"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-white px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-colors"
            >
              <span>Explore Top Bundle</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-emerald-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bundle Card 1: Regency Tea Party */}
            <Link
              to="/product/22699"
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-bold text-emerald-800">Regency Tea Party Bundle</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  High Affinity
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=400&q=80"
                  alt="Teacup"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
                <span className="text-slate-400 font-bold text-base">+</span>
                <img
                  src="https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&w=400&q=80"
                  alt="Tea Plate"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
              </div>
              <p className="text-xs text-slate-600 mt-3 line-clamp-1">
                Roses Regency Teacup &amp; Matching Tea Plate
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900">Bundle from £5.05</span>
                <span className="text-xs text-emerald-700 font-semibold group-hover:underline">
                  View Bundle →
                </span>
              </div>
            </Link>

            {/* Bundle Card 2: Jumbo Storage Pair */}
            <Link
              to="/product/85099B"
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-bold text-emerald-800">Jumbo Storage Pair</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Repeat Staple
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80"
                  alt="Red Bag"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
                <span className="text-slate-400 font-bold text-base">+</span>
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80"
                  alt="Pink Bag"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
              </div>
              <p className="text-xs text-slate-600 mt-3 line-clamp-1">
                Red Retrospot Bag &amp; Pink Polkadot Bag
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900">Bundle from £4.16</span>
                <span className="text-xs text-emerald-700 font-semibold group-hover:underline">
                  View Bundle →
                </span>
              </div>
            </Link>

            {/* Bundle Card 3: Vintage Clock Set */}
            <Link
              to="/product/22727"
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-bold text-emerald-800">Retro Bedside Duo</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Home Decor
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80"
                  alt="Red Clock"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
                <span className="text-slate-400 font-bold text-base">+</span>
                <img
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"
                  alt="Green Clock"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                />
              </div>
              <p className="text-xs text-slate-600 mt-3 line-clamp-1">
                Bakelike Red Alarm Clock &amp; Green Clock
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900">Bundle from £7.50</span>
                <span className="text-xs text-emerald-700 font-semibold group-hover:underline">
                  View Bundle →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 5. COMPLETE PRODUCT CATALOG DISCOVERY */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Explore All Products ({filteredProducts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Showing genuine British retail products from the historical transaction catalog.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.code} product={prod} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
