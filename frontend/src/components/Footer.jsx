import React from "react";
import { Leaf, Mail, Instagram, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-deep text-white/90 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-display text-xl">Verdor</span>
          </div>
          <p className="text-white/60 max-w-md text-sm leading-relaxed">
            Growshop premium argentino. Equipamiento, nutrición y herramientas profesionales
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
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hola@verdor.ar</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +54 11 0000-0000</li>
            <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /> @verdor.growshop</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Verdor Growshop. Todos los derechos reservados.</p>
          <p>Venta exclusiva para mayores de 18 años · Cultivo responsable · REPROCANN reconocido</p>
        </div>
      </div>
    </footer>
  );
}
