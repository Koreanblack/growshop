import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", form);
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-pad max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-forest rounded-full mx-auto flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-display text-3xl mt-5">Panel administrador</h1>
        <p className="text-muted text-sm mt-2">Sólo personal autorizado</p>
      </div>

      <form data-testid="admin-login-form" onSubmit={submit} className="bg-white border border-line rounded-2xl p-7 space-y-4">
        <div>
          <label className="text-xs label-uppercase block mb-1.5">Email</label>
          <input
            data-testid="admin-email"
            required type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-clean"
          />
        </div>
        <div>
          <label className="text-xs label-uppercase block mb-1.5">Contraseña</label>
          <input
            data-testid="admin-password"
            required type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-clean"
          />
        </div>
        {error && <p className="text-sm text-earth" data-testid="admin-login-error">{error}</p>}
        <button data-testid="admin-login-submit" type="submit" disabled={loading} className="btn-forest w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
