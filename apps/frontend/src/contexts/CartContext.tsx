import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '../types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedDate?: Date;
  message?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      const updatedItems = [...state.items, newItem];
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
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
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
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('flora-cart');
    console.log('🛒 Loading cart from localStorage. Raw data:', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 Parsed cart. Item count:', parsedCart.length);
        console.log('🛒 Parsed cart items:', JSON.stringify(parsedCart, null, 2));
        if (parsedCart.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('🛒 No saved cart found in localStorage');
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    console.log('🛒 Saving cart to localStorage. Item count:', state.items.length);
    console.log('🛒 Cart items:', JSON.stringify(state.items, null, 2));
    localStorage.setItem('flora-cart', JSON.stringify(state.items));
  }, [state.items, isInitialized]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
