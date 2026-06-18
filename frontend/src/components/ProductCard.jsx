import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatARS } from "@/lib/api";

export default function ProductCard({ product, index = 0 }) {
  const { add } = useCart();
  return (
    <div
      data-testid={`product-card-${product.slug}`}
      className="card-product flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link to={`/producto/${product.slug}`} className="block aspect-[4/5] bg-sage/40 overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-forest text-white text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
            Destacado
          </span>
        )}
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        {product.brand && (
          <p className="label-uppercase text-[0.65rem] mb-1.5">{product.brand}</p>
        )}
        <Link to={`/producto/${product.slug}`} className="block">
          <h3 className="font-display text-base leading-snug hover:text-forest transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-display text-lg">{formatARS(product.price)}</span>
          <button
            data-testid={`add-to-cart-${product.slug}`}
            onClick={() => add(product)}
            className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center hover:bg-forest-hover transition-colors"
            aria-label="Agregar al carrito"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
