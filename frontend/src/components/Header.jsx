import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, LogOut, Leaf } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { count, setOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-6">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-xl tracking-tight font-medium">Verdor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted">
          <Link to="/catalogo" data-testid="nav-catalog" className="hover:text-ink transition-colors">Catálogo</Link>
          <Link to="/reprocann" data-testid="nav-reprocann" className="hover:text-ink transition-colors">REPROCANN</Link>
          <Link to="/catalogo?cat=iluminacion" className="hover:text-ink transition-colors">Iluminación</Link>
          <Link to="/catalogo?cat=fertilizantes" className="hover:text-ink transition-colors">Nutrición</Link>
        </nav>

        <form onSubmit={onSearch} className="hidden lg:flex flex-1 max-w-sm ml-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            data-testid="header-search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-line text-sm focus:outline-none focus:border-forest"
          />
        </form>

        <div className="flex items-center gap-3 ml-auto lg:ml-0">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                {user.picture && (
                  <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="hidden md:inline text-ink">{user.name?.split(" ")[0]}</span>
              </div>
              <button data-testid="logout-btn" onClick={logout} className="text-muted hover:text-ink p-2">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" data-testid="nav-login" className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-ink">
              <User className="w-4 h-4" /> Ingresar
            </Link>
          )}

          <button
            data-testid="cart-toggle-btn"
            onClick={() => setOpen(true)}
            className="relative w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center hover:border-forest transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span data-testid="cart-count" className="absolute -top-1 -right-1 bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
