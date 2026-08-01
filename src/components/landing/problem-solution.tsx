import { Frown, PackageCheck, ScanSearch, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ProblemSolution() {
  return (
    <section id="problema-solucion" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Una mala tarde no debería definir tu reputación
        </h2>
        <p className="mt-4 text-muted">
          Las plataformas tradicionales premian la emoción del momento. Nosotros
          medimos los hechos.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-rose/20 bg-rose/[0.03] p-8">
          <div className="flex items-center gap-2 text-rose">
            <TrendingDown size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">El problema</span>
          </div>
          <h3 className="mt-4 text-xl font-medium">
            Clientes que aman el producto, pero califican con rabia
          </h3>
          <p className="mt-3 text-muted">
            Un cliente ama tu producto, pero el transportista se retrasó 3 días.
            Escribe una reseña detallando lo bueno y lo malo — y aun así te deja
            1 estrella en caliente. Esa nota, descontextualizada, arrastra tu
            promedio global para siempre.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <Frown className="shrink-0 text-rose" size={28} />
            <div>
              <p className="text-sm font-medium">&ldquo;Todo perfecto, pero llegó tarde&rdquo;</p>
              <p className="text-xs text-muted">Calificación tradicional: ★☆☆☆☆ (1.0)</p>
            </div>
          </div>
        </Card>

        <Card className="border-emerald/20 bg-emerald/[0.03] p-8">
          <div className="flex items-center gap-2 text-emerald">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">Nuestra solución</span>
          </div>
          <h3 className="mt-4 text-xl font-medium">
            Análisis de Sentimiento Ponderado
          </h3>
          <p className="mt-3 text-muted">
            Evaluamos Producto, Atención y Tiempos de Entrega por separado y
            calculamos una nota objetiva — sin tocar ni una palabra del texto
            original del cliente.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <PackageCheck className="shrink-0 text-emerald" size={28} />
            <div>
              <p className="text-sm font-medium">Mismo texto, evaluado por hechos</p>
              <p className="text-xs text-muted">Puntaje Objetivo IA: ★★★★☆ (3.8)</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 md:col-span-2">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="flex items-center gap-3 text-cobalt">
              <Scale size={20} />
              <span className="font-medium">Ponderación transparente</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">40%</span>
              <span className="text-sm text-muted">Calidad del producto</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">30%</span>
              <span className="text-sm text-muted">Atención recibida</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
            <ScanSearch size={20} className="shrink-0 text-cobalt" />
            <p className="text-sm text-muted">
              El 30% restante corresponde al cumplimiento de tiempos de envío —
              cada componente es auditable en el desglose público de la reseña.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
