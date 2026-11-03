import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartSubtotal, completeCheckout, checkoutSuccess, dismissCheckoutSuccess } = useCart();

  const [formData, setFormData] = useState({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.co.uk',
    address: '42 High Street, Flat 3B',
    city: 'London',
    postalCode: 'SW1A 1AA',
    paymentMethod: 'card',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen && !checkoutSuccess) return null;

  const deliveryFee = cartSubtotal >= 25 ? 0 : 3.95;
  const total = Number((cartSubtotal + deliveryFee).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      completeCheckout(formData);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt Success View */}
        {checkoutSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block">
                Order Confirmed
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Thank you for your order!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <strong className="text-slate-800 font-mono">{checkoutSuccess.orderId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-left text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Estimated UK Delivery:</span>
                <strong className="text-emerald-800 font-semibold">{checkoutSuccess.estimatedDelivery}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Items Purchased:</span>
                <span>{checkoutSuccess.items.length} product(s)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery:</span>
                <span className="text-emerald-700 font-medium">
                  {checkoutSuccess.deliveryFee === 0 ? 'FREE' : `£${checkoutSuccess.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Total Paid:</span>
                <span className="text-emerald-800">£{checkoutSuccess.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100/80">
              📦 A confirmation email and tracking link have been simulated. In a live production deployment, this triggers warehouse fulfillment.
            </div>

            <button
              onClick={() => {
                dismissCheckoutSuccess();
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Secure E-Commerce Checkout</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  1. Delivery Details
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  2. Payment Method
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'apple', label: 'Apple Pay', icon: ShieldCheck },
                    { id: 'cod', label: 'Pay on Delivery', icon: Truck },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = formData.paymentMethod === pm.id;
                    return (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center space-y-1 transition-colors ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-semibold'
                            : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.length} items):</span>
                  <span>£{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UK Standard Shipping:</span>
                  <span className="text-emerald-700 font-semibold">
                    {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                  <span>Total to Pay:</span>
                  <span className="text-emerald-800">£{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
              >
                <span>{isSubmitting ? 'Placing Order...' : `Place Order (£${total.toFixed(2)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
