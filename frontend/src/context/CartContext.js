import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext();
const STORAGE_KEY = "verdor_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.product_id === product.id);
      if (found) {
        return prev.map((p) =>
          p.product_id === product.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          title: product.name,
          unit_price: product.price,
          image: product.image,
          quantity: qty,
        },
      ];
    });
    setOpen(true);
  };

  const remove = (product_id) =>
    setItems((prev) => prev.filter((p) => p.product_id !== product_id));

  const updateQty = (product_id, quantity) => {
    if (quantity <= 0) return remove(product_id);
    setItems((prev) =>
      prev.map((p) => (p.product_id === product_id ? { ...p, quantity } : p))
    );
  };

  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider
      value={{ items, add, remove, updateQty, clear, total, count, open, setOpen }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
