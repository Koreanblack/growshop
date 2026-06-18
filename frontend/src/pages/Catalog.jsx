import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "";
  const q = params.get("q") || "";
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { category: cat || undefined, q: q || undefined } })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [cat, q]);

  const title = useMemo(() => {
    if (q) return `Resultados para "${q}"`;
    if (cat) return cats.find((c) => c.slug === cat)?.name || "Catálogo";
    return "Catálogo completo";
  }, [cat, q, cats]);

  const setCat = (slug) => {
    const np = new URLSearchParams(params);
    if (slug) np.set("cat", slug);
    else np.delete("cat");
    np.delete("q");
    setParams(np);
  };

  return (
    <div className="section-pad pt-12">
      <div className="max-w-7xl mx-auto">
        <p className="label-uppercase mb-3">Tienda</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{title}</h1>

        {/* Category pills */}
        <div className="mt-10 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            data-testid="filter-all"
            onClick={() => setCat("")}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
              !cat ? "bg-forest text-white border-forest" : "bg-white border-line text-muted hover:border-forest"
            }`}
          >
            Todos
          </button>
          {cats.map((c) => (
            <button
              key={c.slug}
              data-testid={`filter-${c.slug}`}
              onClick={() => setCat(c.slug)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                cat === c.slug ? "bg-forest text-white border-forest" : "bg-white border-line text-muted hover:border-forest"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {loading ? (
            <p className="text-muted">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-muted">No encontramos productos que coincidan.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
