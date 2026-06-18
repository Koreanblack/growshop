import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { user } = useAuth();

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth-callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (user) {
    return (
      <div className="section-pad max-w-md mx-auto text-center">
        <h1 className="font-display text-3xl">Hola, {user.name}</h1>
        <p className="text-muted mt-2">{user.email}</p>
        <Link to="/" className="btn-forest mt-8 inline-block">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="section-pad max-w-md mx-auto">
      <div className="text-center mb-10">
        <p className="label-uppercase mb-3">Acceso clientes</p>
        <h1 className="font-display text-4xl tracking-tight">Ingresá a Verdor</h1>
        <p className="text-muted mt-3 text-sm">
          Guardá tus pedidos, accedé a tu historial y descuentos REPROCANN.
        </p>
      </div>

      <button
        data-testid="google-login-btn"
        onClick={handleLogin}
        className="w-full bg-white border border-line rounded-full py-3.5 px-5 flex items-center justify-center gap-3 hover:border-forest transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        <span className="font-medium">Continuar con Google</span>
      </button>

      <p className="text-xs text-muted text-center mt-6">
        Al ingresar aceptás nuestros términos y la política de privacidad.
      </p>

      <div className="mt-12 text-center">
        <Link to="/admin/login" className="text-xs text-muted hover:text-ink underline">
          Acceso administradores
        </Link>
      </div>
    </div>
  );
}
