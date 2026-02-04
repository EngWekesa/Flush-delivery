import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string, restaurantId: string) => void;
  updateQuantity: (itemId: string, restaurantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.id === item.id && i.restaurantId === item.restaurantId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (itemId: string, restaurantId: string) => {
    setItems(prev => prev.filter(
      i => !(i.id === itemId && i.restaurantId === restaurantId)
    ));
  };

  const updateQuantity = (itemId: string, restaurantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, restaurantId);
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === itemId && item.restaurantId === restaurantId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
