import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ExternalLink,
  Mail,
  Heart,
} from 'lucide-react';

export const StoreFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-20">
      {/* 1. Value Proposition Row */}
      <div className="border-b border-slate-800 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">Free UK Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Complimentary shipping on orders over £25</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">30-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Hassle-free return policy with pre-paid labels</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">100% Genuine Quality</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Handpicked British heritage homeware essentials</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">Secure Checkout</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">256-bit encrypted card and digital payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Newsletter Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Market Basket Store</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Curated British homeware, artisanal dining sets, and everyday lifestyle essentials inspired by authentic transaction patterns.
          </p>
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-slate-200 block uppercase tracking-wider">
              Subscribe for 10% off your first order
            </span>
            <div className="flex max-w-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-slate-800 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-l-lg border border-slate-700 focus:outline-hidden focus:border-emerald-500 flex-1"
              />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 rounded-r-lg text-xs transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Customer Care</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#help" className="hover:text-emerald-400 transition-colors">Help & FAQs</a></li>
            <li><a href="#shipping" className="hover:text-emerald-400 transition-colors">Track Your Order</a></li>
            <li><a href="#returns" className="hover:text-emerald-400 transition-colors">Delivery & Shipping</a></li>
            <li><a href="#refunds" className="hover:text-emerald-400 transition-colors">Returns & Refunds</a></li>
            <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Shop Departments</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/categories?cat=tableware" className="hover:text-emerald-400 transition-colors">Tableware & Tea Sets</Link></li>
            <li><Link to="/categories?cat=bags" className="hover:text-emerald-400 transition-colors">Storage & Laundry Totes</Link></li>
            <li><Link to="/categories?cat=decor" className="hover:text-emerald-400 transition-colors">Vintage Clocks & Lighting</Link></li>
            <li><Link to="/categories?cat=garden" className="hover:text-emerald-400 transition-colors">Botanical Garden Markers</Link></li>
            <li><Link to="/categories?filter=bestsellers" className="hover:text-emerald-400 transition-colors">UK Best Sellers</Link></li>
          </ul>
        </div>

        {/* Security & Academic Note */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Shopping Guarantee</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All customer transactions are secured with industry-standard encryption. Recommendations generated live from empirical UK market basket data.
          </p>
          <div className="pt-2">
            <span className="text-[10px] text-slate-500 block">Currency & Region</span>
            <span className="text-xs font-semibold text-slate-300">United Kingdom (GBP £)</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar with Discreet Academic Link */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-5 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Market Basket Store Ltd. All rights reserved.
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-400">Cookie Preferences</a>

            {/* Discreet Faculty Analytics Studio link for university evaluators */}
            <Link
              to="/analytics"
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors border-l border-slate-800 pl-4"
              title="Open the academic data mining evaluation studio for faculty review"
            >
              <span>Faculty Analytics Studio</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
