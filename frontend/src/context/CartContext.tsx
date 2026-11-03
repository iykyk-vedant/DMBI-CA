import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDetail } from '../data/products';

export interface CartItem {
  code: string;
  name: string;
  price: number;
  originalPrice: number;
  qty: number;
  image: string;
  category: string;
}

export interface CheckoutReceipt {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  date: string;
  estimatedDelivery: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  checkoutSuccess: CheckoutReceipt | null;
  addToCart: (product: { code: string; name: string; price: number; originalPrice?: number; image?: string; category?: string }, qty?: number) => void;
  addBundleToCart: (products: Array<{ code: string; name: string; price: number; originalPrice?: number; image?: string; category?: string }>) => void;
  updateQty: (code: string, delta: number) => void;
  removeFromCart: (code: string) => void;
  clearCart: () => void;
  toggleWishlist: (code: string) => void;
  isWishlisted: (code: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  openCart: () => void;
  closeCart: () => void;
  completeCheckout: (customerInfo: { fullName: string; address: string; postalCode: string; paymentMethod: string }) => void;
  dismissCheckoutSuccess: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mbs_cart_v1';
const WISHLIST_STORAGE_KEY = 'mbs_wishlist_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default starter item for realistic e-commerce presentation
    return [
      {
        code: '22699',
        name: 'Roses Regency Teacup and Saucer',
        price: 2.95,
        originalPrice: 3.95,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
        category: 'Tableware & Dining',
      },
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['85123A', '22423'];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutReceipt | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const addToCart = (
    product: { code: string; name: string; price: number; originalPrice?: number; image?: string; category?: string },
    qty: number = 1
  ) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.code === product.code);
      if (existing) {
        return prev.map((item) =>
          item.code === product.code ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          code: product.code,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice ?? Number((product.price * 1.25).toFixed(2)),
          qty,
          image: product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
          category: product.category || 'Home Goods',
        },
      ];
    });
    setIsCartOpen(true);
  };

  const addBundleToCart = (
    products: Array<{ code: string; name: string; price: number; originalPrice?: number; image?: string; category?: string }>
  ) => {
    setCart((prev) => {
      let updated = [...prev];
      products.forEach((prod) => {
        const existingIdx = updated.findIndex((item) => item.code === prod.code);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            qty: updated[existingIdx].qty + 1,
          };
        } else {
          updated.push({
            code: prod.code,
            name: prod.name,
            price: prod.price,
            originalPrice: prod.originalPrice ?? Number((prod.price * 1.25).toFixed(2)),
            qty: 1,
            image: prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
            category: prod.category || 'Home Goods',
          });
        }
      });
      return updated;
    });
    setIsCartOpen(true);
  };

  const updateQty = (code: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.code === code) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (code: string) => {
    setCart((prev) => prev.filter((item) => item.code !== code));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (code: string) => {
    setWishlist((prev) =>
      prev.includes(code) ? prev.filter((id) => id !== code) : [...prev, code]
    );
  };

  const isWishlisted = (code: string) => wishlist.includes(code);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const cartSubtotal = Number(cart.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2));
  const wishlistCount = wishlist.length;

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const completeCheckout = (customerInfo: { fullName: string; address: string; postalCode: string; paymentMethod: string }) => {
    const deliveryFee = cartSubtotal >= 25 ? 0 : 3.95;
    const total = Number((cartSubtotal + deliveryFee).toFixed(2));
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `MBS-${randomSuffix}`;

    const receipt: CheckoutReceipt = {
      orderId,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      total,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    };

    setCheckoutSuccess(receipt);
    setCart([]);
    setIsCartOpen(false);
  };

  const dismissCheckoutSuccess = () => {
    setCheckoutSuccess(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        checkoutSuccess,
        addToCart,
        addBundleToCart,
        updateQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        wishlistCount,
        cartSubtotal,
        openCart,
        closeCart,
        completeCheckout,
        dismissCheckoutSuccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

