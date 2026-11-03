import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { getProductMeta, FEATURED_CATALOG } from '../../data/products';
import { FrequentlyBoughtTogether } from '../../components/store/FrequentlyBoughtTogether';
import { ProductCard } from '../../components/store/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { code = '22699' } = useParams<{ code: string }>();
  const { addToCart, toggleWishlist, isWishlisted, openCart } = useCart();

  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
  const [pincode, setPincode] = useState<string>('');
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(false);

  // 1. Fetch live product recommendations from the association rule engine
  const { data: recData, isLoading: isRecLoading } = useQuery({
    queryKey: ['productRec', code],
    queryFn: () => api.recommendProduct(code, 4),
  });

  // Product metadata
  const rawLabel = recData?.query_product?.label;
  const product = getProductMeta(code, rawLabel);
  const wishlisted = isWishlisted(product.code);

  // Gallery images
  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim()) {
      setPincodeChecked(true);
    }
  };

  const handleAddToBag = () => {
    addToCart(
      {
        code: product.code,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToBag();
    openCart();
  };

  // Related products fallback
  const relatedCodes = ['85123A', '22423', '22727', '85099B'].filter((c) => c !== code);
  const relatedProducts = relatedCodes.map((c) => getProductMeta(c));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-slate-500 flex items-center space-x-1.5 flex-wrap">
        <Link to="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/categories?cat=${product.category.toLowerCase().split(' ')[0]}`} className="hover:text-emerald-700 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. NYKAA 3-COLUMN PRODUCT DETAIL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: LEFT - IMAGE SHOWCASE & GALLERY (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-white border border-slate-200/80 rounded-2xl overflow-hidden relative shadow-xs p-2 sm:p-4 flex items-center justify-center group">
            <img
              src={galleryImages[activeImageIdx] || product.image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-1">
              {product.discountPct > 0 && (
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                  {product.discountPct}% OFF
                </span>
              )}
              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                100% Authentic
              </span>
            </div>

            {/* Wishlist & Share buttons */}
            <div className="absolute top-3 right-3 flex flex-col space-y-1.5">
              <button
                onClick={() => toggleWishlist(product.code)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-500 shadow-sm'
                    : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Product link copied to clipboard!');
                }}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail row */}
          {galleryImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: CENTER - PRODUCT SPECIFICATIONS & DETAILS (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
              HERITAGE SELECTION
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
              {product.name}
            </h1>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              Item Code: {product.code}
            </span>
          </div>

          {/* Rating Strip */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{product.rating} / 5.0</span>
            </div>
            <span className="text-slate-400">•</span>
            <a href="#reviews" className="text-emerald-700 hover:underline font-medium">
              {product.reviewsCount.toLocaleString()} Verified Customer Purchases
            </a>
          </div>

          {/* Price Box */}
          <div className="border-t border-b border-slate-100 py-3.5 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                £{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.discountPct > 0 && (
                <span className="bg-emerald-50 text-emerald-800 font-bold text-xs px-2 py-0.5 rounded-full border border-emerald-200">
                  Save {product.discountPct}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Inclusive of all taxes. Free UK delivery available.
            </p>
          </div>

          {/* Product Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <ul className="space-y-1.5 pt-1">
              {product.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-600 space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Details Accordion / Tabs */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex space-x-4 border-b border-slate-100 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="py-3 text-xs text-slate-600">
              {activeTab === 'description' ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Origin</span>
                    <span className="font-medium text-slate-800">United Kingdom</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Material</span>
                    <span className="font-medium text-slate-800">Fine Glazed Ceramic / Stoneware</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Quality Checked</span>
                    <span className="font-medium text-slate-800">Yes, Verified Batch</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-[11px]">
                  <p>• Standard UK Delivery: 2-4 business days.</p>
                  <p>• Free shipping on orders over £25.</p>
                  <p>• 30-Day Hassle-Free Returns with original packaging.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT - BUY BOX & DELIVERY CHECKER (3 cols on lg) */}
        <div className="lg:col-span-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-5 sticky top-24 shadow-2xs">
            {/* Price & Stock status */}
            <div>
              <div className="text-2xl font-black text-slate-900">
                £{product.price.toFixed(2)}
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>In Stock — Ready to Dispatch</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Sold & shipped directly by Market Basket Store
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Quantity
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-l-xl transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-r-xl transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons (Nykaa Style) */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleAddToBag}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Postal Code Delivery Estimator */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check UK Delivery Date</span>
              </label>
              <form onSubmit={handlePincodeCheck} className="flex space-x-1.5">
                <input
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 flex-1"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeChecked && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Standard Delivery by <strong>Thursday</strong> to {pincode.toUpperCase()}. Free on orders over £25.
                  </span>
                </div>
              )}
            </div>

            {/* Trust Points */}
            <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-200/80">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Transaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>30-Day Easy Returns Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FREQUENTLY BOUGHT TOGETHER SECTION (NYKAA STYLE BUNDLE) */}
      <FrequentlyBoughtTogether
        currentProduct={product}
        recommendations={recData?.recommendations || []}
        isLoading={isRecLoading}
      />

      {/* 4. CUSTOMERS ALSO VIEWED SHELF */}
      <section className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Customers Also Viewed
            </h3>
            <p className="text-xs text-slate-500">
              Popular essentials from our curated UK home and lifestyle collections.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedProducts.map((relProd) => (
            <ProductCard key={relProd.code} product={relProd} />
          ))}
        </div>
      </section>
    </div>
  );
};
