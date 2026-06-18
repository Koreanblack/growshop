import React from "react";
import { Mail, Instagram, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-deep text-white/90 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/lilith-logo.jpeg" alt="Lilith Growshop" className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-base tracking-[0.18em] font-medium uppercase">Lilith</span>
              <span className="font-display text-[10px] tracking-[0.32em] text-white/60 uppercase">Growshop</span>
            </div>
          </div>
          <p className="text-white/60 max-w-md text-sm leading-relaxed">
            Growshop premium argentino. Equipamiento, fertilizantes y herramientas profesionales
            para cultivadores responsables. Envíos a todo el país.
          </p>
        </div>

        <div>
          <p className="label-uppercase text-white/50 mb-4">Categorías</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="/catalogo?cat=iluminacion" className="hover:text-white">Iluminación LED</a></li>
            <li><a href="/catalogo?cat=fertilizantes" className="hover:text-white">Fertilizantes</a></li>
            <li><a href="/catalogo?cat=sustratos" className="hover:text-white">Sustratos</a></li>
            <li><a href="/catalogo?cat=accesorios" className="hover:text-white">Accesorios</a></li>
          </ul>
        </div>

        <div>
          <p className="label-uppercase text-white/50 mb-4">Contacto</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hola@lilithgrowshop.ar</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +54 11 0000-0000</li>
            <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /> @lilith.growshop</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Lilith Growshop. Todos los derechos reservados.</p>
          <p>Venta exclusiva para mayores de 18 años · Cultivo responsable · REPROCANN reconocido</p>
        </div>
      </div>
    </footer>
  );
}
