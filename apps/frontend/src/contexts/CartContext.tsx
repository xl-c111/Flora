import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Product } from '../types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedDate?: Date;
  message?: string;
  isSubscription?: boolean;
  purchaseType?: 'one-time' | 'recurring' | 'spontaneous';
  subscriptionFrequency?: 'weekly' | 'fortnightly' | 'monthly';
  subscriptionDiscount?: number; // Percentage discount for subscription
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  purchaseType: 'one-time' | 'recurring' | 'spontaneous';
  frequency: 'weekly' | 'fortnightly' | 'monthly';
  giftMessage?: {
    to: string;
    from: string;
    message: string;
  };
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_PURCHASE_TYPE'; payload: 'one-time' | 'recurring' | 'spontaneous' }
  | { type: 'SET_FREQUENCY'; payload: 'weekly' | 'fortnightly' | 'monthly' }
  | { type: 'SET_GIFT_MESSAGE'; payload: { to: string; from: string; message: string } };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  setPurchaseType: (type: 'one-time' | 'recurring' | 'spontaneous') => void;
  setFrequency: (frequency: 'weekly' | 'fortnightly' | 'monthly') => void;
  setGiftMessage: (message: { to: string; from: string; message: string }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if the same product with same subscription settings AND delivery date already exists
      const existingItemIndex = state.items.findIndex((item) => {
        // Normalize dates for comparison using UTC components (YYYY-MM-DD format)
        const getDateKey = (date?: Date) => {
          if (!date) return null;
          const d = new Date(date);
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const existingDateKey = getDateKey(item.selectedDate);
        const newDateKey = getDateKey(action.payload.selectedDate);

        return (
          item.product.id === action.payload.product.id &&
          item.isSubscription === action.payload.isSubscription &&
          item.subscriptionFrequency === action.payload.subscriptionFrequency &&
          existingDateKey === newDateKey
        );
      });

      let updatedItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Product with same settings and delivery date exists - increase quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        // New product or different delivery date - add to cart
        const newItem: CartItem = {
          ...action.payload,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        };
        updatedItems = [...state.items, newItem];
      }

      const total = calculateTotal(updatedItems);
      return { ...state, items: updatedItems, total };
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      const total = calculateTotal(updatedItems);
      return { ...state, items: updatedItems, total };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const total = calculateTotal(updatedItems);
      return { ...state, items: updatedItems, total };
    }
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'LOAD_CART': {
      const total = calculateTotal(action.payload);
      return { ...state, items: action.payload, total };
    }
    case 'SET_PURCHASE_TYPE':
      return { ...state, purchaseType: action.payload };
    case 'SET_FREQUENCY':
      return { ...state, frequency: action.payload };
    case 'SET_GIFT_MESSAGE':
      return { ...state, giftMessage: action.payload };
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (total, item) => {
      let itemPrice = item.product.priceCents * item.quantity;

      // Apply subscription discount if this is a subscription item
      if (item.isSubscription && item.subscriptionDiscount) {
        itemPrice = itemPrice * (1 - item.subscriptionDiscount / 100);
      }

      return total + itemPrice;
    },
    0
  );
};

// Helper function to group cart items by delivery date
export const groupItemsByDeliveryDate = (items: CartItem[]): Array<{ date: string | null; items: CartItem[] }> => {
  const groups = new Map<string, CartItem[]>();

  items.forEach((item) => {
    // Create a key based on the delivery date
    // Items without a date are grouped together with key 'no-date'
    let dateKey = 'no-date';

    if (item.selectedDate) {
      const d = new Date(item.selectedDate);
      // Use LOCAL date components (not UTC) to match what user selected
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateKey = `${year}-${month}-${day}`;
    }

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  });

  // Convert Map to array of groups
  // Store the dateKey string directly as the date for display
  const result = Array.from(groups.entries()).map(([dateKey, items]) => ({
    date: dateKey === 'no-date' ? null : dateKey, // Keep as string YYYY-MM-DD
    items,
  }));

  return result;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  // window.scrollTo({ top: 0, behavior: 'smooth' });
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize state with localStorage data if available
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    total: 0,
    purchaseType: 'one-time',
    frequency: 'weekly',
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('flora-cart');
    const savedGiftMessage = localStorage.getItem('flora-cart-gift-message');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        // Convert date strings back to Date objects
        const normalizedCart = parsedCart.map((item: any) => ({
          ...item,
          selectedDate: item.selectedDate ? new Date(item.selectedDate) : undefined,
        }));

        if (normalizedCart.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: normalizedCart });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    // Load gift message
    if (savedGiftMessage) {
      try {
        const parsedMessage = JSON.parse(savedGiftMessage);
        dispatch({ type: 'SET_GIFT_MESSAGE', payload: parsedMessage });
      } catch (error) {
        console.error('Error loading gift message from localStorage:', error);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem('flora-cart', JSON.stringify(state.items));
  }, [state.items, isInitialized]);

  // Save gift message to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    if (state.giftMessage) {
      localStorage.setItem('flora-cart-gift-message', JSON.stringify(state.giftMessage));
    }
  }, [state.giftMessage, isInitialized]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const getItemCount = useCallback(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const setPurchaseType = useCallback((type: 'one-time' | 'recurring' | 'spontaneous') => {
    dispatch({ type: 'SET_PURCHASE_TYPE', payload: type });
  }, []);

  const setFrequency = useCallback((frequency: 'weekly' | 'fortnightly' | 'monthly') => {
    dispatch({ type: 'SET_FREQUENCY', payload: frequency });
  }, []);

  const setGiftMessage = useCallback((message: { to: string; from: string; message: string }) => {
    dispatch({ type: 'SET_GIFT_MESSAGE', payload: message });
  }, []);

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getItemCount,
    setPurchaseType,
    setFrequency,
    setGiftMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
