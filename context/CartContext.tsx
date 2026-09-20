'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  isFree?: boolean;
  count: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (id: number, name: string, price: number, options?: { originalPrice?: number; isFree?: boolean }) => void;
  increaseCount: (id: number) => void;
  decreaseCount: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('faraz_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem('faraz_cart');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('faraz_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (id: number, name: string, price: number, options: { originalPrice?: number; isFree?: boolean } = {}) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === id ? { ...item, ...options, count: item.count + 1 } : item
        );
      }
      return [...prevItems, { id, name, price, ...options, count: 1 }];
    });
  };

  const increaseCount = (id: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };

  const decreaseCount = (id: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.count > 0 ? { ...item, count: item.count - 1 } : item
      ).filter(item => item.count > 0)
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, increaseCount, decreaseCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}