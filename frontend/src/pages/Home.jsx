import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, Truck, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="section-pad pb-0 lg:pb-0">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="label-uppercase mb-5">Argentina · Growshop Premium</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight font-light text-ink leading-[1.05]">
              Cultivar con
              <span className="block italic font-normal text-forest">precisión.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
              Equipamiento, nutrición y herramientas de alta gama. Curado por cultivadores,
              para quienes buscan resultados profesionales en cada cosecha.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/catalogo" data-testid="hero-shop-btn" className="btn-forest inline-flex items-center gap-2">
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/reprocann" data-testid="hero-reprocann-btn" className="btn-outline">
                Acreditá tu REPROCANN
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { icon: Sparkles, label: "Curaduría", text: "Solo marcas verificadas" },
                { icon: Truck, label: "Envíos", text: "Toda Argentina · 48–72h" },
                { icon: ShieldCheck, label: "Compra segura", text: "MercadoPago" },
              ].map((f) => (
                <div key={f.label}>
                  <f.icon className="w-5 h-5 text-forest mb-2" strokeWidth={1.5} />
                  <p className="font-medium text-sm">{f.label}</p>
                  <p className="text-xs text-muted mt-1 leading-snug">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sage">
              <img
                src="https://images.pexels.com/photos/28129603/pexels-photo-28129603.jpeg?w=900"
                alt="Cultivo premium"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Leaf className="w-4 h-4 text-forest" />
                  <p className="label-uppercase text-[0.65rem]">Equipo recomendado</p>
                </div>
                <p className="font-display text-lg leading-snug">Kit Indoor Profesional</p>
                <p className="text-sm text-muted mt-1">Iluminación LED · Sustrato · Nutrición completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-uppercase mb-3">Explorá</p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">Por categoría</h2>
            </div>
            <Link to="/catalogo" className="text-sm text-muted hover:text-ink hidden sm:inline-flex items-center gap-1">
              Ver todo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {cats.map((cat, i) => (
              <Link
                key={cat.slug}
                data-testid={`category-card-${cat.slug}`}
                to={`/catalogo?cat=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-sage animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="font-display text-lg leading-tight">{cat.name}</p>
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section-pad pt-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="label-uppercase mb-3">Selección</p>
                <h2 className="font-display text-3xl sm:text-4xl tracking-tight">Lo más buscado</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
              {featured.slice(0, 8).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REPROCANN BAND */}
      <section className="section-pad pt-0">
        <div className="max-w-7xl mx-auto rounded-2xl bg-forest text-white p-10 lg:p-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="label-uppercase text-white/60 mb-4">Pacientes</p>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-light">
              Cultivás bajo REPROCANN — te acompañamos.
            </h2>
            <p className="mt-4 text-white/70 max-w-md leading-relaxed">
              Acreditá tu inscripción y accedé a descuentos, asesoramiento personalizado y
              acompañamiento técnico para tu cultivo medicinal.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Link to="/reprocann" data-testid="reprocann-cta" className="inline-flex bg-white text-forest px-7 py-4 rounded-full font-medium hover:bg-sage transition-colors">
              Acreditar REPROCANN
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
