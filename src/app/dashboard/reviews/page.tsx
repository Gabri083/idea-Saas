import { Download } from "lucide-react";
import { ReviewsTable } from "@/components/dashboard/reviews-table";
import { getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function ReviewsPage() {
  const businessId = await requireBusinessId();
  const reviews = await getReviews(businessId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tablero de control de reseñas</h1>
          <p className="mt-1 text-sm text-muted">
            Filtra, revisa el desglose y decide qué reseñas apelar o marcar como resueltas.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page navigation */}
        <a
          href="/api/reviews/export"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Download size={14} /> Exportar CSV
        </a>
      </div>

      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
