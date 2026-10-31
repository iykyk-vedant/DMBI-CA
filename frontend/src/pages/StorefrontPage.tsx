import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ShoppingCart,
  Search,
  Star,
  Check,
  Plus,
  Minus,
  Trash2,
  ExternalLink,
  Tag,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
  X,
  PackageCheck,
  Sliders,
  ChevronRight,
  Coffee,
  ShoppingBag,
  Clock,
  Sprout,
  Heart
} from 'lucide-react';

interface CartItem {
  code: string;
  label: string;
  price: number;
  qty: number;
}

interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  primaryCode: string;
  tag: string;
  liftHighlight: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'regency-tea',
    title: 'Regency Tea Party',
    subtitle: 'Classic Victorian teacups & matching plates',
    icon: Coffee,
    primaryCode: '22699',
    tag: 'Lift: 39.1x',
    liftHighlight: '90% Confidence cross-purchase',
  },
  {
    id: 'jumbo-bags',
    title: 'Jumbo Storage Bags',
    subtitle: 'Retrospot & Woodland polka-dot collections',
    icon: ShoppingBag,
    primaryCode: '85099B',
    tag: 'Lift: 21.4x',
    liftHighlight: 'High-volume repeat staple',
  },
  {
    id: 'herb-garden',
    title: 'Herb Garden Kit',
    subtitle: 'Parsley, Rosemary, Chives & Thyme markers',
    icon: Sprout,
    primaryCode: '22908',
    tag: 'Lift: 75.0x',
    liftHighlight: 'Highest Lift in entire dataset',
  },
  {
    id: 'alarm-clocks',
    title: 'Vintage Alarm Clocks',
    subtitle: 'Retro Bakelike mechanical bedside clocks',
    icon: Clock,
    primaryCode: '22727',
    tag: 'Lift: 14.8x',
    liftHighlight: 'Multi-room home decor pair',
  },
  {
    id: 'top-bestseller',
    title: 'UK #1 Best Seller',
    subtitle: 'White Hanging Heart T-Light Holder',
    icon: Heart,
    primaryCode: '85123A',
    tag: '12.6% Baskets',
    liftHighlight: 'Most frequent item in UK dataset',
  },
];

// Curated catalog products for Amazon department shelves
const SHOWCASE_PRODUCTS = [
  { code: '22699', label: 'ROSES REGENCY TEACUP AND SAUCER', price: 6.95, rating: 4.9, reviews: 2140, category: 'Kitchen & Dining' },
  { code: '85099B', label: 'JUMBO BAG RED RETROSPOT', price: 2.50, rating: 4.8, reviews: 3820, category: 'Storage & Organization' },
  { code: '22908', label: 'HERB MARKER ROSEMARY', price: 1.85, rating: 4.7, reviews: 940, category: 'Garden & Outdoor' },
  { code: '22727', label: 'ALARM CLOCK BAKELIKE RED', price: 8.50, rating: 4.9, reviews: 1420, category: 'Home Decor' },
  { code: '85123A', label: 'WHITE HANGING HEART T-LIGHT HOLDER', price: 3.95, rating: 4.9, reviews: 5410, category: 'Lighting & Decor' },
  { code: '22697', label: 'GREEN REGENCY TEACUP AND SAUCER', price: 6.95, rating: 4.8, reviews: 1890, category: 'Kitchen & Dining' },
  { code: '20712', label: 'JUMBO BAG WOODLAND ANIMALS', price: 2.50, rating: 4.7, reviews: 1650, category: 'Storage & Organization' },
  { code: '22423', label: 'REGENCY CAKESTAND 3 TIER', price: 12.75, rating: 4.9, reviews: 2980, category: 'Kitchen & Dining' },
];

export const StorefrontPage: React.FC = () => {
  // Active selected product on display in PDP
  const [selectedProductCode, setSelectedProductCode] = useState<string>('22699');
  
  // Search query & autocomplete state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { code: '22699', label: 'ROSES REGENCY TEACUP AND SAUCER', price: 6.95, qty: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modal explanation state
  const [explanationRule, setExplanationRule] = useState<{
    ant: string;
    con: string;
    lift: number;
    conf: number;
    supp?: number;
    explanation?: string;
  } | null>(null);

  // Bundle checkboxes for "Frequently Bought Together"
  const [bundleChecked, setBundleChecked] = useState<{ [code: string]: boolean }>({});

  // 1. Fetch autocomplete search results
  const { data: searchResults } = useQuery({
    queryKey: ['productSearch', searchQuery],
    queryFn: () => api.searchProducts(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });

  // 2. Fetch single product recommendations for the selected PDP product
  const { data: singleRecData, isLoading: isRecLoading } = useQuery({
    queryKey: ['productRec', selectedProductCode],
    queryFn: () => api.recommendProduct(selectedProductCode, 4),
  });

  // 3. Fetch cart recommendations based on all items currently in cart
  const cartCodes = cart.map((item) => item.code);
  const { data: cartRecData, isLoading: isCartRecLoading } = useQuery({
    queryKey: ['cartRec', cartCodes.join(',')],
    queryFn: () => api.recommendCart(cartCodes, 4),
    enabled: cartCodes.length > 0,
  });

  // Reset bundle checkboxes when selected product changes
  useEffect(() => {
    if (singleRecData?.recommendations) {
      const initial: { [code: string]: boolean } = { [selectedProductCode]: true };
      singleRecData.recommendations.slice(0, 2).forEach((r) => {
        initial[r.code] = true;
      });
      setBundleChecked(initial);
    }
  }, [singleRecData, selectedProductCode]);

  // Active PDP product details
  const activeProduct = singleRecData?.query_product ?? {
    code: selectedProductCode,
    label: SHOWCASE_PRODUCTS.find((p) => p.code === selectedProductCode)?.label || 'Selected Product',
  };

  const activeProductPrice = SHOWCASE_PRODUCTS.find((p) => p.code === selectedProductCode)?.price || 5.95;

  // Cart operations
  const addToCart = (code: string, label: string, price: number = 4.95) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.code === code);
      if (existing) {
        return prev.map((item) => (item.code === code ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { code, label, price, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (code: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.code === code) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (code: string) => {
    setCart((prev) => prev.filter((item) => item.code !== code));
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Recommendations for Frequently Bought Together (top 2 from single product rec)
  const bundleRecommendations = (singleRecData?.recommendations || []).slice(0, 2);

  // Calculate bundle total price
  const bundleItems = [
    { code: activeProduct.code, label: activeProduct.label, price: activeProductPrice },
    ...bundleRecommendations.map((r) => ({
      code: r.code,
      label: r.label,
      price: SHOWCASE_PRODUCTS.find((p) => p.code === r.code)?.price || 4.50,
      lift: r.lift,
      conf: r.confidence,
    })),
  ];

  const bundleTotal = bundleItems.reduce((sum, item) => (bundleChecked[item.code] ? sum + item.price : sum), 0);

  const addBundleToCart = () => {
    bundleItems.forEach((item) => {
      if (bundleChecked[item.code]) {
        addToCart(item.code, item.label, item.price);
      }
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen">
      {/* 1. TOP ANNOUNCEMENT & DEMO SCENARIO BAR */}
      <div className="bg-emerald-700 text-white border-b border-emerald-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
              Live Demonstration
            </span>
            <span>
              <strong>Amazon-Style E-Commerce Recommender:</strong> Powered by real-time Association Rule Mining on 16,506 UK baskets.
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              to="/"
              className="inline-flex items-center space-x-1 bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch to Faculty Analytics Studio 📊</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PRESET DEMO SCENARIOS BAR */}
      <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 text-xs scrollbar-none">
          <span className="font-bold text-slate-700 whitespace-nowrap flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            1-Click Faculty Demo Scenarios:
          </span>
          <div className="flex items-center space-x-2">
            {DEMO_SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedProductCode === sc.primaryCode;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedProductCode(sc.primaryCode)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sc.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200 text-emerald-900'}`}>
                    {sc.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. AMAZON STOREFRONT NAVIGATION HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-black text-slate-900 tracking-tight">amazon</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fresh / DMBI</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center">
                  <span>Deliver to VESIT Lab, Chembur 400071</span>
                </div>
              </div>
            </div>

            {/* Amazon Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <div className="flex rounded-lg shadow-xs border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 overflow-hidden bg-white">
                <div className="bg-slate-100 border-r border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hidden sm:flex items-center">
                  All Departments
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search 3,900 UK retail items (e.g. teacup, bag, clock, herb)..."
                  className="flex-1 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 flex items-center justify-center transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && searchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                  <div className="p-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Products Discovered in Market Basket Database</span>
                    <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setSelectedProductCode(item.code);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-xs text-slate-700 transition-colors border-b border-slate-50 last:border-none"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="font-medium text-slate-800">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium">Select PDP →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Header Navigation & Cart */}
            <div className="flex items-center space-x-4 shrink-0">
              <Link to="/explorer" className="hidden lg:block text-xs text-slate-600 hover:text-emerald-700">
                <div className="text-[10px] text-slate-400">Mining Engine</div>
                <div className="font-bold">1,865 Rules</div>
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-lg font-bold text-xs transition-colors relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-emerald-700" />
                  {cartTotalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {cartTotalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Basket</span>
                <span className="text-emerald-700 font-extrabold">£{cartTotalPrice.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center space-x-1.5">
          <Link to="/" className="hover:text-emerald-700">DMBI Catalog</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Home & Dining</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-800">{activeProduct.label}</span>
        </div>

        {/* 5. AMAZON PRODUCT DETAIL SECTION (PDP) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1: Product Showcase Illustration */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-full aspect-square bg-gradient-to-tr from-emerald-50 via-slate-50 to-teal-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Stock Code: {activeProduct.code}
                </div>
                <div className="w-28 h-28 rounded-2xl bg-white shadow-md border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShoppingBag className="w-14 h-14 text-emerald-600 stroke-[1.5]" />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    Verified UK Transaction Product
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Catalog presence: 16,506 Multi-Item Baskets
                  </span>
                </div>
              </div>

              {/* Status pill */}
              <div className="w-full mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> In Stock for Same-Day Prime
                </span>
                <span className="text-[10px] font-mono text-emerald-700">Verified UCI 352</span>
              </div>
            </div>

            {/* Column 2: Product Specifications & Details */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  #1 Best Seller in UK Baskets
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1.5 leading-snug">
                  {activeProduct.label}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">StockCode: {activeProduct.code}</p>
              </div>

              {/* Ratings */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-emerald-700 font-semibold">4.9 out of 5</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">2,481 ratings & co-purchases</span>
              </div>

              <div className="border-t border-b border-slate-100 py-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">£{activeProductPrice.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 line-through">£{(activeProductPrice * 1.3).toFixed(2)}</span>
                  <span className="text-xs font-bold text-emerald-600">Save 23%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Inclusive of all taxes. Free UK delivery on orders over £25.
                </p>
              </div>

              {/* Data mining metadata highlights */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-900">About this item in DMBI Case Study:</div>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 marker:text-emerald-500">
                  <li>Demonstrates FP-Growth Association Rule Mining with mathematically proven support floor (1%).</li>
                  <li>Provides candidate recommendations evaluated on 3,302 unseen holdout baskets (80/20 train/test).</li>
                  <li>All recommendations are dynamically triggered based on true empirical transaction history.</li>
                </ul>
              </div>
            </div>

            {/* Column 3: Amazon Buy Box */}
            <div className="md:col-span-3">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-4">
                <div>
                  <div className="text-xl font-bold text-slate-900">£{activeProductPrice.toFixed(2)}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">FREE delivery tomorrow</div>
                  <div className="text-[11px] text-slate-500">Order within 4 hrs 12 mins</div>
                </div>

                <div className="text-xs text-emerald-700 font-semibold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  In Stock & Ready to Ship
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => addToCart(activeProduct.code, activeProduct.label, activeProductPrice)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all text-xs flex items-center justify-center space-x-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Basket</span>
                  </button>

                  <button
                    onClick={() => {
                      addToCart(activeProduct.code, activeProduct.label, activeProductPrice);
                      setIsCartOpen(true);
                    }}
                    className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-semibold py-2 px-4 rounded-lg transition-colors text-xs"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>Dispatched from:</span>
                    <span className="font-medium text-slate-700">VESIT DMBI Lab</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sold by:</span>
                    <span className="font-medium text-slate-700">RetailSense E-Commerce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. STAR DEMO: AMAZON "FREQUENTLY BOUGHT TOGETHER" BUNDLE WIDGET */}
        <section className="bg-white border-2 border-emerald-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Frequently bought together
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by Top Association Rules discovered via FP-Growth on multi-item baskets.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Empirical Association Rule Engine
              </span>
            </div>
          </div>

          {/* Bundle Items Visual Equation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Item Cards Equation */}
            <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
              {bundleItems.map((item, idx) => (
                <React.Fragment key={item.code}>
                  {idx > 0 && (
                    <span className="text-lg font-bold text-slate-400 px-1">+</span>
                  )}
                  <div
                    className={`bg-slate-50 border rounded-xl p-3 flex items-center space-x-3 transition-all ${
                      bundleChecked[item.code]
                        ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/30'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!bundleChecked[item.code]}
                      onChange={(e) =>
                        setBundleChecked((prev) => ({ ...prev, [item.code]: e.target.checked }))
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="max-w-[180px]">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        £{item.price.toFixed(2)}
                      </div>
                      {idx > 0 && 'lift' in item && (
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            {item.lift?.toFixed(1)}x Lift
                          </span>
                          <span className="text-[9px] text-slate-500">
                            ({Math.round((item.conf ?? 0) * 100)}% Conf)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Total Price & One-Click Add Bundle CTA */}
            <div className="lg:col-span-4 bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div>
                <span className="text-xs text-slate-500">Total bundle price:</span>
                <div className="text-2xl font-black text-slate-900">£{bundleTotal.toFixed(2)}</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Save on combined packaging & shipping
                </div>
              </div>

              <button
                onClick={addBundleToCart}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add all selected to Basket</span>
              </button>

              <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click Cross-Sell Bundle Integration</span>
              </div>
            </div>
          </div>

          {/* Under the Hood Data Mining Insights for Faculty Evaluation */}
          {bundleRecommendations.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 flex items-center">
                  <Info className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Data Mining Justification for Evaluators:
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Algorithm: FP-Growth (min_supp=1%, min_conf=50%)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bundleRecommendations.map((rec) => (
                  <div key={rec.code} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        Rule: [{activeProduct.code}] → [{rec.code}]
                      </span>
                      <button
                        onClick={() =>
                          setExplanationRule({
                            ant: activeProduct.label,
                            con: rec.label,
                            lift: rec.lift,
                            conf: rec.confidence,
                            supp: 0.015,
                            explanation: rec.explanation,
                          })
                        }
                        className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center"
                      >
                        Inspect Proof <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                    <div className="text-slate-800 font-medium text-xs mt-1 truncate">{rec.label}</div>
                    <p className="text-[11px] text-slate-500 mt-1 italic">{rec.explanation}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-600 font-medium">
                      <span>Lift: <strong className="text-emerald-700">{rec.lift.toFixed(2)}x</strong></span>
                      <span>Confidence: <strong className="text-emerald-700">{(rec.confidence * 100).toFixed(1)}%</strong></span>
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold capitalize">
                        {rec.rule_type || 'Complementary'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 7. AMAZON PRODUCT SHELVES / DEPARTMENT BROWSING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Explore Best-Selling UK Retail Products
              </h3>
              <p className="text-xs text-slate-500">
                Click any product below to simulate viewing its PDP and auto-generating its Market Basket bundle.
              </p>
            </div>
            <Link
              to="/explorer"
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center"
            >
              See all 1,865 Rules in Explorer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {SHOWCASE_PRODUCTS.map((prod) => {
              const isCurrent = prod.code === selectedProductCode;
              return (
                <div
                  key={prod.code}
                  className={`bg-white border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="aspect-square bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center relative p-4">
                      <ShoppingBag className="w-12 h-12 text-emerald-600/80 stroke-1" />
                      <span className="absolute top-2 left-2 bg-white/90 border border-slate-200 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded">
                        {prod.code}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Viewing
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      {prod.category}
                    </span>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 h-8">
                      {prod.label}
                    </h4>

                    <div className="flex items-center space-x-1 text-[11px] text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-700">{prod.rating}</span>
                      <span className="text-slate-400">({prod.reviews.toLocaleString()})</span>
                    </div>

                    <div className="text-base font-black text-slate-900">
                      £{prod.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="pt-3 space-y-1.5">
                    <button
                      onClick={() => {
                        setSelectedProductCode(prod.code);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isCurrent ? 'Current PDP Item' : 'Inspect PDP & Bundles'}
                    </button>

                    <button
                      onClick={() => addToCart(prod.code, prod.label, prod.price)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Basket</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 8. SLIDE-OVER AMAZON CART DRAWER WITH LIVE BASKET RECOMMENDER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
              {/* Cart Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Your Shopping Basket</h3>
                    <p className="text-[11px] text-slate-500">
                      {cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''} in cart
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <ShoppingCart className="w-12 h-12 mx-auto stroke-1" />
                    <p className="text-xs">Your basket is currently empty.</p>
                    <button
                      onClick={() => {
                        addToCart('22699', 'ROSES REGENCY TEACUP AND SAUCER', 6.95);
                      }}
                      className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700"
                    >
                      Add Regency Teacup
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.code}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-start justify-between space-x-3 shadow-2xs"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{item.label}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">[{item.code}]</span>
                          <div className="text-xs font-bold text-slate-900 mt-1">
                            £{(item.price * item.qty).toFixed(2)}
                          </div>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center space-x-1.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                          <button
                            onClick={() => updateCartQty(item.code, -1)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-slate-800">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.code, 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.code)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-white rounded ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* LIVE BASKET RECOMMENDATION SECTION */}
                {cart.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Recommended For Your Basket
                        </h4>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        Live MBA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Customers who bought items currently in your cart also bought:
                    </p>

                    {isCartRecLoading ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Computing maximal association rules...
                      </div>
                    ) : cartRecData?.recommendations && cartRecData.recommendations.length > 0 ? (
                      <div className="space-y-2">
                        {cartRecData.recommendations.map((rec) => (
                          <div
                            key={rec.code}
                            className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {rec.label}
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] mt-0.5">
                                <span className="font-bold text-emerald-700">
                                  {rec.lift.toFixed(1)}x Lift
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600">
                                  {Math.round(rec.confidence * 100)}% Conf
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(rec.code, rec.label, 4.95)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shrink-0 flex items-center space-x-1 shadow-xs transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 text-center">
                        No additional rules match this exact combination.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Footer & Checkout */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>£{cartTotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery:</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Total:</span>
                    <span className="text-emerald-700">£{cartTotalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('Demo Checkout simulated! In a real deployment, this triggers order fulfillment.');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Proceed to Demo Checkout (£{cartTotalPrice.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. RULE EXPLANATION MODAL (FACULTY INSPECTION) */}
      {explanationRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Data Mining Rule Inspection
                </h3>
              </div>
              <button
                onClick={() => setExplanationRule(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Discovered Association Rule:
                </span>
                <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                  [{explanationRule.ant}] → [{explanationRule.con}]
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Lift Ratio</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {explanationRule.lift.toFixed(2)}x
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Confidence</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {(explanationRule.conf * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Support</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {((explanationRule.supp ?? 0.015) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 space-y-1">
                <strong className="text-slate-900 block">Plain English Interpretation:</strong>
                <p>{explanationRule.explanation}</p>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Customers purchasing {explanationRule.ant} are {explanationRule.lift.toFixed(1)} times more likely to purchase {explanationRule.con} than by random chance.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplanationRule(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
