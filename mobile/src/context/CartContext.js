import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);
const STORAGE_KEY = '@growshop_cart';

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'ADD': {
      const existing = state.find((i) => i.product_id === action.item.product_id);
      if (existing) {
        return state.map((i) =>
          i.product_id === action.item.product_id
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      }
      return [...state, action.item];
    }
    case 'REMOVE':
      return state.filter((i) => i.product_id !== action.productId);
    case 'UPDATE_QTY':
      return state.map((i) =>
        i.product_id === action.productId ? { ...i, quantity: action.qty } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) dispatch({ type: 'LOAD', payload: JSON.parse(raw) });
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) =>
    dispatch({
      type: 'ADD',
      item: {
        product_id: product.id,
        title: product.name,
        unit_price: product.price,
        image: product.image,
        quantity,
      },
    });

  const removeItem = (productId) => dispatch({ type: 'REMOVE', productId });
  const updateQty = (productId, qty) => dispatch({ type: 'UPDATE_QTY', productId, qty });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
