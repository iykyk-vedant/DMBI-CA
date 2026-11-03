import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductDetail } from '../../data/products';

interface ProductCardProps {
  product: ProductDetail;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.code);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-md transition-all duration-200 group">
      <div>
        {/* Image Container with Badges */}
        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative mb-3">
          <Link to={`/product/${product.code}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Discount Tag */}
          {product.discountPct > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPct}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product.code)}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              wishlisted
                ? 'bg-rose-50 text-rose-500 shadow-xs'
                : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 backdrop-blur-xs'
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Category Label */}
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          {product.category}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product.code}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mt-1 h-9">
            {product.name}
          </h3>
        </Link>

        {/* Rating Strip */}
        <div className="flex items-center space-x-1.5 mt-1.5">
          <div className="flex items-center space-x-0.5 bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            ({product.reviewsCount.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline space-x-2 mt-2">
          <span className="text-sm sm:text-base font-bold text-slate-900">
            £{product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              £{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3">
        <button
          onClick={() =>
            addToCart({
              code: product.code,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              category: product.category,
            })
          }
          className="w-full bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
};

