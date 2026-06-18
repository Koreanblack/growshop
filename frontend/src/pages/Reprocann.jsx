import React, { useState } from "react";
import { Leaf, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Reprocann() {
  const [form, setForm] = useState({
    full_name: "",
    dni: "",
    email: "",
    phone: "",
    reprocann_number: "",
    notes: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/reprocann", form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Error enviando el formulario");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="section-pad max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-forest" strokeWidth={1.2} />
        <h1 className="font-display text-4xl mt-6">Solicitud recibida</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Gracias por acreditar tu REPROCANN. Vamos a revisar tu solicitud y te contactaremos en
          un plazo de 24 a 48hs hábiles para activar tu acceso a descuentos y asesoramiento.
        </p>
      </div>
    );
  }

  return (
    <div className="section-pad pt-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-forest" />
          <p className="label-uppercase">Pacientes registrados</p>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">Acreditación REPROCANN</h1>
        <p className="mt-5 text-muted leading-relaxed max-w-2xl">
          Si estás inscripto en el Registro del Programa de Cannabis (REPROCANN) en Argentina,
          completá el formulario para acceder a beneficios exclusivos: descuentos en
          equipamiento, asesoramiento técnico personalizado y acompañamiento durante todo el
          ciclo de cultivo.
        </p>

        <form
          data-testid="reprocann-form"
          onSubmit={submit}
          className="mt-12 bg-white border border-line rounded-2xl p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs label-uppercase block mb-1.5">Nombre completo</label>
              <input data-testid="rc-name" required value={form.full_name} onChange={update("full_name")} className="input-clean" />
            </div>
            <div>
              <label className="text-xs label-uppercase block mb-1.5">DNI</label>
              <input data-testid="rc-dni" required value={form.dni} onChange={update("dni")} className="input-clean" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs label-uppercase block mb-1.5">Email</label>
              <input data-testid="rc-email" required type="email" value={form.email} onChange={update("email")} className="input-clean" />
            </div>
            <div>
              <label className="text-xs label-uppercase block mb-1.5">Teléfono</label>
              <input data-testid="rc-phone" required value={form.phone} onChange={update("phone")} className="input-clean" />
            </div>
          </div>
          <div>
            <label className="text-xs label-uppercase block mb-1.5">N° de inscripción REPROCANN (opcional)</label>
            <input data-testid="rc-number" value={form.reprocann_number} onChange={update("reprocann_number")} className="input-clean" placeholder="Si todavía no lo tenés, dejalo vacío" />
          </div>
          <div>
            <label className="text-xs label-uppercase block mb-1.5">Comentarios</label>
            <textarea data-testid="rc-notes" rows={3} value={form.notes} onChange={update("notes")} className="input-clean" placeholder="Contanos sobre tu cultivo o necesidades específicas..." />
          </div>

          {error && <p className="text-sm text-earth">{error}</p>}

          <button data-testid="reprocann-submit" type="submit" disabled={loading} className="btn-forest w-full">
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
          <p className="text-xs text-muted">
            Tus datos son confidenciales y sólo se usan para validar tu acreditación.
          </p>
        </form>
      </div>
    </div>
  );
}
