import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag, FileCheck, Plus, Trash2, LogOut, Edit2, X } from "lucide-react";
import { api, formatARS } from "@/lib/api";

const CATEGORIES = [
  "iluminacion", "fertilizantes", "sustratos", "macetas", "accesorios", "control-plagas", "herramientas",
];

const EMPTY_PRODUCT = {
  name: "", description: "", price: 0, category: "iluminacion",
  stock: 0, image: "", brand: "", featured: false,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reprocann, setReprocann] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadAll();
  }, [navigate]);

  const loadAll = async () => {
    try {
      const [p, o, r] = await Promise.all([
        api.get("/products"),
        api.get("/admin/orders"),
        api.get("/admin/reprocann"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
      setReprocann(r.data);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const openCreate = () => {
    setForm(EMPTY_PRODUCT);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditing(p.id);
    setShowForm(true);
  };

  const [formError, setFormError] = useState(null);
  const saveProduct = async (e) => {
    e.preventDefault();
    setFormError(null);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Error guardando el producto");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await api.delete(`/admin/products/${id}`);
    loadAll();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl">Lilith · Admin</h1>
          <button data-testid="admin-logout" onClick={logout} className="text-sm text-muted hover:text-ink flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="flex gap-1 border-b border-line mb-8 overflow-x-auto no-scrollbar">
          {[
            { k: "products", label: "Productos", icon: Package, n: products.length },
            { k: "orders", label: "Pedidos", icon: ShoppingBag, n: orders.length },
            { k: "reprocann", label: "REPROCANN", icon: FileCheck, n: reprocann.length },
          ].map((t) => (
            <button
              key={t.k}
              data-testid={`admin-tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${tab === t.k ? "border-forest text-forest" : "border-transparent text-muted hover:text-ink"}`}
            >
              <t.icon className="w-4 h-4" /> {t.label} <span className="text-xs text-muted">({t.n})</span>
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl">Catálogo</h2>
              <button data-testid="admin-add-product" onClick={openCreate} className="btn-forest inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuevo producto
              </button>
            </div>

            <div className="bg-white border border-line rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover bg-sage" />
                        <span className="font-medium">{p.name}</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category}</td>
                      <td className="px-4 py-3">{formatARS(p.price)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <button data-testid={`admin-edit-${p.id}`} onClick={() => openEdit(p)} className="p-2 hover:bg-bg rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button data-testid={`admin-delete-${p.id}`} onClick={() => removeProduct(p.id)} className="p-2 hover:bg-bg rounded text-earth">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            <h2 className="font-display text-2xl px-6 py-5 border-b border-line">Pedidos</h2>
            {orders.length === 0 ? (
              <p className="px-6 py-8 text-muted">Todavía no hay pedidos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-bg border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_id.slice(0, 8)}</td>
                      <td className="px-4 py-3">{o.payer_name} <span className="text-muted text-xs block">{o.payer_email}</span></td>
                      <td className="px-4 py-3">{formatARS(o.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${o.status === "paid" ? "bg-forest text-white" : o.status === "failed" ? "bg-red-100 text-red-700" : "bg-sage text-forest"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">{new Date(o.created_at).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "reprocann" && (
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            <h2 className="font-display text-2xl px-6 py-5 border-b border-line">Solicitudes REPROCANN</h2>
            {reprocann.length === 0 ? (
              <p className="px-6 py-8 text-muted">No hay solicitudes todavía.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-bg border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">DNI</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">REPROCANN N°</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {reprocann.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">{r.full_name}</td>
                      <td className="px-4 py-3">{r.dni}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.reprocann_number || "—"}</td>
                      <td className="px-4 py-3 text-muted text-xs">{new Date(r.created_at).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-2xl">{editing ? "Editar" : "Nuevo"} producto</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-bg rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="text-xs label-uppercase block mb-1.5">Nombre</label>
                <input data-testid="prod-form-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-clean" />
              </div>
              <div>
                <label className="text-xs label-uppercase block mb-1.5">Descripción</label>
                <textarea data-testid="prod-form-desc" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-clean" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs label-uppercase block mb-1.5">Precio (ARS)</label>
                  <input data-testid="prod-form-price" required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-clean" />
                </div>
                <div>
                  <label className="text-xs label-uppercase block mb-1.5">Stock</label>
                  <input data-testid="prod-form-stock" required type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-clean" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs label-uppercase block mb-1.5">Categoría</label>
                  <select data-testid="prod-form-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-clean">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs label-uppercase block mb-1.5">Marca</label>
                  <input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-clean" />
                </div>
              </div>
              <div>
                <label className="text-xs label-uppercase block mb-1.5">URL imagen</label>
                <input data-testid="prod-form-image" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-clean" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Destacado en home
              </label>
              {formError && <p className="text-sm text-earth" data-testid="prod-form-error">{formError}</p>}
              <button data-testid="prod-form-submit" type="submit" className="btn-forest w-full">
                {editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
