"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiScoreCard } from "@/components/review/ai-score-card";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

export function ReviewForm({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [gutRating, setGutRating] = useState(0);
  const [review, setReview] = useState<Review | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          customer_name: formData.get("customer_name"),
          customer_email: formData.get("customer_email"),
          review_text: formData.get("review_text"),
          customer_star_rating: gutRating || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error al enviar tu reseña.");

      setReview(data.review);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setStatus("error");
    }
  }

  if (status === "done" && review) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs text-muted">Tu reseña, publicada tal cual la escribiste</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            {review.review_text}
          </p>
          <p className="mt-3 text-xs text-muted">— {review.customer_name}</p>
        </div>

        <AiScoreCard review={review} />
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          maxLength={120}
          placeholder="Tu nombre"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="customer_email"
          name="customer_email"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
        <p className="text-xs text-muted">Solo para verificar tu compra. Nunca se publica.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review_text" className="text-sm font-medium">
          Cuéntanos tu experiencia completa
        </label>
        <textarea
          id="review_text"
          name="review_text"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder="Escribe con total libertad — nada de tu texto será editado ni censurado."
          className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          ¿Qué calificación le habrías puesto en caliente? <span className="text-muted">(opcional)</span>
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setGutRating(n === gutRating ? 0 : n)}
              className="p-1"
              aria-label={`${n} estrellas`}
            >
              <Star
                size={26}
                className={cn(
                  "transition-colors",
                  n <= gutRating ? "fill-amber text-amber" : "text-border hover:text-amber/60",
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          Esto no cambia tu reseña — solo nos ayuda a mostrar la diferencia entre la emoción y los hechos.
        </p>
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Analizando con IA…
          </>
        ) : (
          <>
            <ShieldCheck size={18} /> Publicar mi reseña
          </>
        )}
      </Button>
    </form>
  );
}
