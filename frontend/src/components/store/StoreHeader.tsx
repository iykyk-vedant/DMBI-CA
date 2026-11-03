import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  Menu,
  ChevronDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { formatTitleCase } from '../../data/products';

export const StoreHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, cartSubtotal, wishlistCount, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live autocomplete query
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['productSearch', searchQuery],
    queryFn: () => api.searchProducts(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (code: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${code}`);
  };

  const navCategories = [
    { label: 'Home', path: '/' },
    { label: 'Tableware & Dining', path: '/categories?cat=tableware' },
    { label: 'Storage & Bags', path: '/categories?cat=bags' },
    { label: 'Home Decor', path: '/categories?cat=decor' },
    { label: 'Best Sellers', path: '/categories?filter=bestsellers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs">
      {/* 1. Subtle Promotional Top Bar */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-[11px] sm:text-xs">
              Complimentary UK Delivery on orders over £25 • 30-Day Easy Returns
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-500">
            <span>Customer Service: +44 800 123 4567</span>
            <span>•</span>
            <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
          </div>
        </div>
      </div>

      {/* 2. Main E-Commerce Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                Market Basket
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-700 block -mt-1">
                Store
              </span>
            </div>
          </Link>

          {/* Large Center Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden sm:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search products, collections, categories (e.g. teacup, bag, clock)..."
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-hidden transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 overflow-hidden max-h-80 overflow-y-auto">
                <div className="px-4 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Suggestions</span>
                  {isSearchLoading && <span className="text-emerald-600 font-normal">Searching...</span>}
                </div>

                {searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {searchResults.slice(0, 8).map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleSelectProduct(item.code)}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-800 truncate group-hover:text-emerald-800">
                              {formatTitleCase(item.label)}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {item.code}
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : !isSearchLoading ? (
                  <div className="px-4 py-4 text-center text-xs text-slate-500">
                    No matching products found. Try typing &quot;teacup&quot;, &quot;bag&quot;, or &quot;clock&quot;.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Action Icons: Wishlist, Cart, Profile */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {/* Wishlist */}
            <Link
              to="/categories?filter=wishlist"
              className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button (Nykaa Style) */}
            <button
              onClick={openCart}
              className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 px-3.5 py-2 rounded-full font-medium transition-all group"
              aria-label="View Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-700 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-700 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase">Bag</span>
                <span className="font-bold text-emerald-900 mt-0.5">£{cartSubtotal.toFixed(2)}</span>
              </div>
            </button>

            {/* User Profile */}
            <div className="hidden md:flex items-center space-x-2 pl-1 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <span className="text-[10px] text-slate-400 block">Welcome</span>
                <span className="text-xs font-semibold text-slate-800">Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Category Navigation Bar (Clean Nykaa Style) */}
        <nav className="hidden md:flex items-center space-x-8 py-3 text-xs font-semibold text-slate-600 border-t border-slate-100">
          {navCategories.map((cat) => {
            const isActive = location.pathname + location.search === cat.path;
            return (
              <Link
                key={cat.label}
                to={cat.path}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-700 -mb-3 pb-2.5'
                    : 'hover:text-emerald-700'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="space-y-1">
            {navCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
