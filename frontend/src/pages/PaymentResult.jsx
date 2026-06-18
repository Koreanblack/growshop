import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Home } from "lucide-react";
import { api, formatARS } from "@/lib/api";

export default function PaymentResult() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const order_id = params.get("order_id");
  const isDemo = params.get("demo") === "1";
  const [order, setOrder] = useState(null);

  const path = location.pathname;
  const variant = path.includes("success")
    ? "success"
    : path.includes("pending")
      ? "pending"
      : "failure";

  useEffect(() => {
    if (!order_id) return;
    api.get(`/orders/${order_id}`).then((r) => setOrder(r.data)).catch(() => {});
  }, [order_id]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-forest",
      title: "¡Pago aprobado!",
      sub: "Tu compra fue procesada con éxito. Pronto recibirás un email con los detalles.",
    },
    pending: {
      icon: Clock,
      color: "text-earth",
      title: "Pago pendiente",
      sub: "Tu pago todavía está siendo procesado. Te avisaremos por email cuando se acredite.",
    },
    failure: {
      icon: XCircle,
      color: "text-red-600",
      title: "Pago rechazado",
      sub: "Hubo un problema con tu pago. Podés intentarlo nuevamente.",
    },
  }[variant];

  const Icon = config.icon;

  return (
    <div className="section-pad max-w-2xl mx-auto text-center">
      <Icon className={`w-16 h-16 mx-auto ${config.color}`} strokeWidth={1.2} />
      <h1 data-testid="payment-result-title" className="font-display text-4xl mt-6">{config.title}</h1>
      <p className="text-muted mt-3">{config.sub}</p>

      {isDemo && (
        <div className="mt-6 inline-block bg-sage text-forest text-xs px-3 py-1.5 rounded-full">
          MODO DEMO · MercadoPago no configurado todavía
        </div>
      )}

      {order && (
        <div className="mt-10 bg-white border border-line rounded-2xl p-6 text-left">
          <p className="label-uppercase mb-3">Detalle de la orden</p>
          <p className="text-sm"><strong>ID:</strong> {order.order_id}</p>
          <p className="text-sm"><strong>Estado interno:</strong> {order.status}</p>
          {order.mp_status && <p className="text-sm"><strong>Estado MP:</strong> {order.mp_status}</p>}
          <p className="text-sm mt-2"><strong>Total:</strong> {formatARS(order.total)}</p>
        </div>
      )}

      <div className="mt-10 flex gap-3 justify-center">
        <Link to="/" className="btn-outline inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
        {variant === "failure" && (
          <Link to="/checkout" className="btn-forest">Reintentar pago</Link>
        )}
      </div>
    </div>
  );
}
