import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Truck, ShieldCheck, RotateCcw, Plus, Minus } from "lucide-react";
import { api, formatARS } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => setProduct(r.data));
  }, [slug]);

  if (!product) {
    return <div className="section-pad text-muted">Cargando...</div>;
  }

  return (
    <div className="section-pad pt-10">
      <div className="max-w-6xl mx-auto">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl bg-sage/40 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            {product.brand && <p className="label-uppercase mb-3">{product.brand}</p>}
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{product.name}</h1>
            <p className="mt-6 text-muted leading-relaxed">{product.description}</p>
            <p className="mt-8 font-display text-3xl">{formatARS(product.price)}</p>
            <p className="text-xs text-muted mt-1">
              {product.stock > 0 ? `Stock disponible (${product.stock})` : "Sin stock"}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-3 border border-line rounded-full px-3 py-2">
                <button data-testid="qty-decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="p-1">
                  <Minus className="w-4 h-4" />
                </button>
                <span data-testid="qty-value" className="w-6 text-center">{qty}</span>
                <button data-testid="qty-increase" onClick={() => setQty(qty + 1)} className="p-1">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                data-testid="product-add-cart-btn"
                onClick={() => add(product, qty)}
                disabled={product.stock <= 0}
                className="btn-forest flex-1 sm:flex-none"
              >
                Agregar al carrito
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-line">
              {[
                { icon: Truck, label: "Envío", text: "48–72h" },
                { icon: ShieldCheck, label: "Pago seguro", text: "MercadoPago" },
                { icon: RotateCcw, label: "Cambios", text: "7 días" },
              ].map((f) => (
                <div key={f.label}>
                  <f.icon className="w-4 h-4 text-forest mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
