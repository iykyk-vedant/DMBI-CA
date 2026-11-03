import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { getProductMeta } from '../../data/products';
import { CheckoutModal } from '../../components/store/CheckoutModal';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQty,
    removeFromCart,
    addToCart,
    cartCount,
    cartSubtotal,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const cartCodes = cart.map((item) => item.code);
  const { data: cartRecData } = useQuery({
    queryKey: ['cartCrossSellPage', cartCodes.join(',')],
    queryFn: () => api.recommendCart(cartCodes, 4),
    enabled: cartCodes.length > 0,
  });

  const freeShippingThreshold = 25.0;
  const deliveryFee = cartSubtotal >= freeShippingThreshold ? 0 : 3.95;
  const orderTotal = Number((cartSubtotal + deliveryFee).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Your Shopping Bag</h1>
        <p className="text-xs text-slate-500 mt-1">
          {cartCount} item{cartCount !== 1 ? 's' : ''} currently in your basket
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Your bag is currently empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Explore our best-selling British homeware, afternoon tea sets, and storage bags.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-2xs divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.code} className="py-4 first:pt-0 last:pb-0 flex space-x-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      SKU: {item.code}
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      £{item.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQty(item.code, -1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-l-xl transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.code, 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-r-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right w-20">
                    <div className="text-sm font-black text-slate-900">
                      £{(item.price * item.qty).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.code)}
                      className="text-xs text-rose-500 hover:underline mt-1 inline-block"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Live Basket Recommender */}
            {cartRecData?.recommendations && cartRecData.recommendations.length > 0 && (
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Frequently Picked With Your Bag
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cartRecData.recommendations.slice(0, 4).map((rec) => {
                    const meta = getProductMeta(rec.code, rec.label);
                    return (
                      <div
                        key={rec.code}
                        className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <img
                          src={meta.image}
                          alt={meta.name}
                          className="w-14 h-14 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {meta.name}
                          </h4>
                          <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                            £{meta.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            addToCart({
                              code: meta.code,
                              name: meta.name,
                              price: meta.price,
                              originalPrice: meta.originalPrice,
                              image: meta.image,
                              category: meta.category,
                            })
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center space-x-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 sticky top-24 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="font-semibold text-slate-900">£{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>UK Standard Shipping:</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `£${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total (incl. VAT):</span>
                  <span className="text-emerald-800">£{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit Bank Level Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};

