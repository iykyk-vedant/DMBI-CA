import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { getProductMeta, formatTitleCase } from '../../data/products';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQty,
    removeFromCart,
    addToCart,
    cartCount,
    cartSubtotal,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Dynamic MBA Cart Recommendations based on active items in cart
  const cartCodes = cart.map((item) => item.code);
  const { data: cartRecData, isLoading: isRecLoading } = useQuery({
    queryKey: ['cartCrossSell', cartCodes.join(',')],
    queryFn: () => api.recommendCart(cartCodes, 3),
    enabled: cartCodes.length > 0 && isCartOpen,
  });

  if (!isCartOpen) return null;

  const freeShippingThreshold = 25.0;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPct = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const deliveryFee = cartSubtotal >= freeShippingThreshold ? 0 : 3.95;
  const orderTotal = Number((cartSubtotal + deliveryFee).toFixed(2));

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={closeCart}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100">
            {/* 1. Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Shopping Bag</h3>
                  <span className="text-[11px] text-slate-500">
                    {cartCount} item{cartCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close Shopping Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Free Shipping Progress Bar */}
            <div className="bg-emerald-50/50 px-5 py-3 border-b border-emerald-100/60">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-900 mb-1.5">
                <span>
                  {freeShippingRemaining > 0
                    ? `Add £${freeShippingRemaining.toFixed(2)} more for FREE Delivery`
                    : '🎉 You have unlocked Free UK Delivery!'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">{freeShippingPct}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingPct}%` }}
                />
              </div>
            </div>

            {/* 3. Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Your bag is empty</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Discover our curated British tableware, homeware, and storage collections.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.code}
                      className="bg-white border border-slate-100 rounded-xl p-3 flex space-x-3 hover:border-slate-200 transition-all shadow-2xs"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-semibold text-slate-900 truncate pr-2">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.code)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            SKU: {item.code}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs font-bold text-slate-900">
                            £{(item.price * item.qty).toFixed(2)}
                            {item.qty > 1 && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (£{item.price.toFixed(2)} each)
                              </span>
                            )}
                          </div>

                          {/* Quantity selector */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateQty(item.code, -1)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-l transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-800">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.code, 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-r transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Dynamic Live Basket Cross-Sell Shelf */}
              {cart.length > 0 && cartRecData?.recommendations && cartRecData.recommendations.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        Frequently Picked With Your Bag
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Popular Pairings
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cartRecData.recommendations.slice(0, 3).map((rec) => {
                      const meta = getProductMeta(rec.code, rec.label);
                      return (
                        <div
                          key={rec.code}
                          className="bg-slate-50/80 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-emerald-200 transition-colors"
                        >
                          <img
                            src={meta.image}
                            alt={meta.name}
                            className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-medium text-slate-900 truncate">
                              {meta.name}
                            </h5>
                            <div className="flex items-center space-x-2 text-[11px] mt-0.5">
                              <span className="font-bold text-slate-900">£{meta.price.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 line-through">
                                £{meta.originalPrice.toFixed(2)}
                              </span>
                            </div>
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center space-x-1 transition-colors shadow-2xs"
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

            {/* 5. Drawer Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">£{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UK Standard Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-semibold">FREE</span>
                      ) : (
                        `£${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Estimated Total</span>
                    <span className="text-emerald-800 font-black">£{orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit SSL Secure Checkout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
};

