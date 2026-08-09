"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { BUSINESS_CATEGORY_LABELS } from "@/lib/types";

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.get("business_name"),
          full_name: formData.get("full_name"),
          category: formData.get("category"),
          business_description: formData.get("business_description") || undefined,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la cuenta.");

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_name" className="text-sm font-medium">
          Nombre de tu tienda
        </label>
        <input
          id="business_name"
          name="business_name"
          required
          minLength={2}
          placeholder="Mi Tienda"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          Rubro de tu negocio
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        >
          <option value="" disabled>
            Elige una opción
          </option>
          {Object.entries(BUSINESS_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          Le da contexto a la IA para juzgar reseñas de forma justa según tu rubro.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_description" className="text-sm font-medium">
          Cuéntanos brevemente qué vende tu negocio{" "}
          <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id="business_description"
          name="business_description"
          rows={2}
          maxLength={300}
          placeholder="Ej. Zapatillas urbanas hechas a mano, envíos a todo Chile."
          className="resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          Tu nombre
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          placeholder="Tu nombre completo"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 w-full">
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Creando cuenta…
          </>
        ) : (
          <>
            <ShieldCheck size={18} /> Crear cuenta
          </>
        )}
      </Button>
    </form>
  );
}
