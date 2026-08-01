import { MessageSquareText, BarChart3, BadgeCheck } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "El cliente escribe libremente",
    description:
      "Sin filtros, sin barreras, sin censura. El cliente cuenta su experiencia completa, tal como la vivió.",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "La IA desglosa los hechos",
    description:
      "GPT-4o analiza Producto, Atención y Envíos por separado y emite un puntaje ponderado, ignorando el tono emocional.",
  },
  {
    icon: BadgeCheck,
    step: "03",
    title: "Estrellas imparciales, publicadas",
    description:
      "El resultado se publica en tu e-commerce con un widget transparente y auditable — cada punto tiene una explicación.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border/60 bg-surface/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cómo funciona</h2>
          <p className="mt-4 text-muted">De la reseña en bruto a una calificación defendible, en segundos.</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative flex flex-col items-start">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-background text-cobalt">
                <Icon size={28} />
              </div>
              <span className="mt-5 text-xs font-mono text-muted">{step}</span>
              <h3 className="mt-2 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
