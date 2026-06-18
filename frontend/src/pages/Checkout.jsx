import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { api, formatARS } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({
    payer_name: "",
    payer_email: "",
    phone: "",
    shipping_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map((it) => ({
          product_id: it.product_id,
          title: it.title,
          quantity: it.quantity,
          unit_price: it.unit_price,
        })),
      };
      const { data } = await api.post("/orders/checkout", payload);
      const url = data.sandbox_init_point || data.init_point;
      if (data.demo_mode) {
        // demo: clear cart and redirect
        clear();
      }
      if (url) {
        window.location.href = url;
      } else {
        navigate(`/payment/pending?order_id=${data.order_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error iniciando el pago");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-pad max-w-3xl mx-auto">
        <h1 className="font-display text-4xl mb-3">Checkout</h1>
        <p className="text-muted">Tu carrito está vacío. Agregá productos antes de continuar.</p>
      </div>
    );
  }

  return (
    <div className="section-pad pt-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <p className="label-uppercase mb-3">Finalizar compra</p>
          <h1 className="font-display text-4xl tracking-tight mb-8">Datos de envío</h1>

          <form data-testid="checkout-form" onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs label-uppercase block mb-1.5">Nombre completo</label>
              <input
                data-testid="checkout-name"
                required value={form.payer_name} onChange={update("payer_name")}
                className="input-clean" placeholder="Juan Pérez"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs label-uppercase block mb-1.5">Email</label>
                <input
                  data-testid="checkout-email"
                  required type="email" value={form.payer_email} onChange={update("payer_email")}
                  className="input-clean" placeholder="vos@email.com"
                />
              </div>
              <div>
                <label className="text-xs label-uppercase block mb-1.5">Teléfono</label>
                <input
                  data-testid="checkout-phone"
                  required value={form.phone} onChange={update("phone")}
                  className="input-clean" placeholder="+54 9 11 ..."
                />
              </div>
            </div>
            <div>
              <label className="text-xs label-uppercase block mb-1.5">Dirección de envío</label>
              <textarea
                data-testid="checkout-address"
                required value={form.shipping_address} onChange={update("shipping_address")}
                rows={3} className="input-clean" placeholder="Calle, número, piso/depto, ciudad, provincia, CP"
              />
            </div>

            {error && <p className="text-sm text-earth" data-testid="checkout-error">{error}</p>}

            <button data-testid="mp-checkout-btn" type="submit" disabled={loading} className="btn-mp w-full justify-center">
              <CreditCard className="w-5 h-5" />
              {loading ? "Conectando con MercadoPago..." : "Pagar con MercadoPago"}
            </button>
            <p className="text-xs text-muted text-center">
              Al continuar serás redirigido al checkout seguro de MercadoPago.
            </p>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-line rounded-2xl p-7 sticky top-28">
            <h3 className="font-display text-xl mb-5">Tu pedido</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {items.map((it) => (
                <div key={it.product_id} className="flex gap-3 text-sm">
                  <img src={it.image} alt="" className="w-14 h-14 rounded-md object-cover bg-sage" />
                  <div className="flex-1">
                    <p className="font-medium leading-snug">{it.title}</p>
                    <p className="text-muted text-xs mt-0.5">x{it.quantity} · {formatARS(it.unit_price)}</p>
                  </div>
                  <span className="font-medium">{formatARS(it.unit_price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line my-5" />
            <div className="flex items-center justify-between">
              <span className="text-muted">Total</span>
              <span data-testid="checkout-total" className="font-display text-2xl">{formatARS(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
