import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, ShoppingBag, Heart, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../../components/store/ProductCard';
import { FEATURED_CATALOG, getProductMeta, ProductDetail } from '../../data/products';
import { useCart } from '../../context/CartContext';

export const CategoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useCart();

  const activeCategoryParam = searchParams.get('cat') || 'all';
  const activeFilterParam = searchParams.get('filter') || 'all';
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const baseCatalogList: ProductDetail[] = Object.values(FEATURED_CATALOG).map((item) =>
    getProductMeta(item.code!, item.name)
  );

  const categories = [
    { id: 'all', label: 'All Departments' },
    { id: 'tableware', label: 'Tableware & Dining' },
    { id: 'bags', label: 'Storage & Bags' },
    { id: 'decor', label: 'Home Decor' },
    { id: 'clocks', label: 'Vintage Clocks' },
    { id: 'garden', label: 'Garden & Outdoor' },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...baseCatalogList];

    // Filter by Wishlist if selected
    if (activeFilterParam === 'wishlist') {
      list = list.filter((p) => wishlist.includes(p.code));
    }

    // Filter by Category
    if (activeCategoryParam !== 'all') {
      list = list.filter((p) => {
        const cat = p.category.toLowerCase();
        if (activeCategoryParam === 'tableware') return cat.includes('tableware') || cat.includes('dining');
        if (activeCategoryParam === 'bags') return cat.includes('storage') || cat.includes('bag');
        if (activeCategoryParam === 'decor') return cat.includes('decor') || cat.includes('clock');
        if (activeCategoryParam === 'clocks') return cat.includes('clock');
        if (activeCategoryParam === 'garden') return cat.includes('garden');
        return true;
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [baseCatalogList, activeCategoryParam, activeFilterParam, sortBy, wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center space-x-1.5">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">
          {activeFilterParam === 'wishlist'
            ? 'My Wishlist'
            : activeCategoryParam === 'all'
            ? 'All Catalog Products'
            : categories.find((c) => c.id === activeCategoryParam)?.label || 'Category'}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeFilterParam === 'wishlist'
              ? 'Saved Wishlist Items'
              : activeCategoryParam === 'all'
              ? 'Curated Homeware Catalog'
              : categories.find((c) => c.id === activeCategoryParam)?.label}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredAndSortedProducts.length} verified British retail items
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 text-xs">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="popular">Most Popular (Co-Purchases)</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-xs text-slate-900 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filter Departments</span>
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const isSelected = activeCategoryParam === cat.id && activeFilterParam !== 'wishlist';
              return (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ cat: cat.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setSearchParams({ filter: 'wishlist' })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                activeFilterParam === 'wishlist'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>My Wishlist</span>
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {wishlist.length}
              </span>
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeFilterParam === 'wishlist'
                  ? 'You have not added any items to your wishlist yet. Tap the heart icon on any product card to save it.'
                  : 'No products match the selected filters. Try choosing another department.'}
              </p>
              <Link
                to="/categories"
                className="inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full mt-2"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredAndSortedProducts.map((prod) => (
                <ProductCard key={prod.code} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

