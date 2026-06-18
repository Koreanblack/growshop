import React from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatARS } from "@/lib/api";

export default function CartDrawer() {
  const { items, remove, updateQty, total, open, setOpen } = useCart();

  return (
    <>
      {open && (
        <div
          data-testid="cart-backdrop"
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 flex items-center justify-between border-b border-line">
            <h3 className="font-display text-xl">Tu carrito</h3>
            <button
              data-testid="cart-close-btn"
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-bg rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <ShoppingBag className="w-12 h-12 text-muted/40 mb-4" strokeWidth={1.2} />
              <p className="text-muted">Tu carrito está vacío</p>
              <Link to="/catalogo" onClick={() => setOpen(false)} className="btn-outline mt-6 inline-block">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {items.map((it) => (
                  <div key={it.product_id} data-testid={`cart-item-${it.product_id}`} className="flex gap-4">
                    <img src={it.image} alt={it.title} className="w-20 h-20 object-cover rounded-lg bg-sage" />
                    <div className="flex-1">
                      <p className="font-medium text-sm leading-snug">{it.title}</p>
                      <p className="text-sm text-muted mt-1">{formatARS(it.unit_price)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          data-testid={`cart-decrease-${it.product_id}`}
                          onClick={() => updateQty(it.product_id, it.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:border-forest"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span data-testid={`cart-qty-${it.product_id}`} className="text-sm w-6 text-center">{it.quantity}</span>
                        <button
                          data-testid={`cart-increase-${it.product_id}`}
                          onClick={() => updateQty(it.product_id, it.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:border-forest"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          data-testid={`cart-remove-${it.product_id}`}
                          onClick={() => remove(it.product_id)}
                          className="ml-auto text-xs text-muted hover:text-earth"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Subtotal</span>
                  <span data-testid="cart-subtotal" className="font-display text-xl">{formatARS(total)}</span>
                </div>
                <p className="text-xs text-muted">Envío y descuentos se calculan en el checkout.</p>
                <Link
                  data-testid="cart-checkout-btn"
                  to="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-forest w-full text-center block"
                >
                  Ir al checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
