"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const CATEGORIAS = [
  "Hidromasajes/Jacuzzis y Tinas",
  "Baños",
  "Zona de labores",
  "Cocinas",
  "Accesorios",
  "Deseo contactar un asesor",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    celularWhatsapp: "",
    email: "",
    categoria: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validación en cliente: Nombre obligatorio
    if (!formData.nombres.trim()) {
      setStatusMessage({
        type: "error",
        text: "Por favor ingresa tu nombre.",
      });
      return;
    }

    const emailTrimmed = formData.email.trim();
    const telTrimmed = formData.celularWhatsapp.trim();

    // Validación en cliente: Al menos teléfono o email
    if (!emailTrimmed && !telTrimmed) {
      setStatusMessage({
        type: "error",
        text: "Por favor ingresa al menos un número de teléfono o un correo electrónico.",
      });
      return;
    }

    // Validación en cliente: Formato de email si fue ingresado
    if (emailTrimmed && !EMAIL_REGEX.test(emailTrimmed)) {
      setStatusMessage({
        type: "error",
        text: "Por favor ingresa un correo electrónico con formato válido.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          celularWhatsapp: formData.celularWhatsapp,
          email: formData.email,
          categoria: formData.categoria,
          urlOrigen: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setStatusMessage({
          type: "success",
          text: "¡Solicitud recibida con éxito! Un asesor se comunicará contigo pronto.",
        });
        // Limpiar el formulario en caso de éxito
        setFormData({
          nombres: "",
          apellidos: "",
          celularWhatsapp: "",
          email: "",
          categoria: "",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data?.error || "No pudimos enviar tu solicitud, intenta de nuevo",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "No pudimos enviar tu solicitud, intenta de nuevo",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Fondo simulado de tienda similar a la referencia */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/40 via-neutral-900 to-black pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center filter blur-xs" />
        <div className="p-8 max-w-6xl mx-auto flex justify-between text-neutral-400 text-sm">
          <div className="flex gap-6">
            <span>Baños ▾</span>
            <span>Accesorios ▾</span>
            <span>Cocinas ▾</span>
          </div>
          <div>Asesoría de Obra</div>
        </div>
      </div>

      {/* Botón para reabrir modal si se cierra */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="z-10 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
        >
          Abrir formulario de asesoría
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="relative z-20 w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 transition-colors p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Título */}
          <div className="text-center mb-6 pt-2">
            <h2 className="text-xl md:text-2xl font-normal text-neutral-800 leading-snug">
              ¡Hola! para recibir asesoría
              <br />
              <span className="font-normal">
                en línea, completa los siguientes datos
              </span>
            </h2>
          </div>

          {/* Mensajes de estado */}
          {statusMessage && (
            <div
              className={`mb-5 p-3 rounded-lg text-sm flex items-start gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fila 1: Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Nombres"
                  required
                  className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 text-base"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Apellidos"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 text-base"
                />
              </div>
            </div>

            {/* Fila 2: Celular - Whatsapp y Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="tel"
                  name="celularWhatsapp"
                  value={formData.celularWhatsapp}
                  onChange={handleChange}
                  placeholder="Celular - Whatsapp"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 text-base"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 text-base"
                />
              </div>
            </div>

            {/* Fila 3: Categoría de interés */}
            <div>
              <div className="relative">
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-neutral-800 bg-white focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 text-base appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Categoría de interés
                  </option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#00c067] hover:bg-[#00ad5c] active:bg-[#009b52] text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar datos</span>
                )}
              </button>
            </div>
          </form>

          {/* Información de conexión a CRM */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
            <span>CRM Firplak</span>
            <span className="font-mono text-[11px] truncate max-w-[280px]">
              API Leads (Ambiente de Pruebas)
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
