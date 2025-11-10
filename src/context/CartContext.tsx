import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, CartItem, Product } from '../services/supabase';
import { useAuth } from './AuthContext';

type CartContextType = {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('carts')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setCartItems(data as CartItem[]);
    }
    setLoading(false);
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated');

    const existing = cartItems.find(item => item.product_id === productId);

    if (existing) {
      const { error } = await supabase
        .from('carts')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('carts')
        .insert({ user_id: user.id, product_id: productId, quantity });
      if (error) throw error;
    }

    await fetchCart();
  };

  const removeFromCart = async (cartId: string) => {
    const { error } = await supabase.from('carts').delete().eq('id', cartId);
    if (error) throw error;
    await fetchCart();
  };

  const updateQuantity = async (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartId);
    } else {
      const { error } = await supabase
        .from('carts')
        .update({ quantity })
        .eq('id', cartId);
      if (error) throw error;
      await fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id);
    if (error) throw error;
    setCartItems([]);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
