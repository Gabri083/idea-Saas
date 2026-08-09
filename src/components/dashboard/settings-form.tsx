"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_CATEGORY_LABELS } from "@/lib/types";
import type { Business } from "@/lib/types";

export function SettingsForm({ business }: { business: Business }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          contact_email: formData.get("contact_email"),
          category: formData.get("category"),
          business_description: formData.get("business_description") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre del negocio
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          defaultValue={business.name}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact_email" className="text-sm font-medium">
          Correo de contacto
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          required
          defaultValue={business.contact_email}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          Rubro
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={business.category ?? "otro"}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        >
          {Object.entries(BUSINESS_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">Le da contexto a la IA para juzgar reseñas según tu rubro.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_description" className="text-sm font-medium">
          Descripción breve <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id="business_description"
          name="business_description"
          rows={2}
          maxLength={300}
          defaultValue={business.business_description ?? ""}
          className="resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" disabled={status === "saving"} className="w-fit">
        {status === "saving" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Guardando…
          </>
        ) : status === "saved" ? (
          <>
            <Check size={16} /> Guardado
          </>
        ) : (
          <>
            <Save size={16} /> Guardar cambios
          </>
        )}
      </Button>
    </form>
  );
}
