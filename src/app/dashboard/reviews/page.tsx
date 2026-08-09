import { ReviewsTable } from "@/components/dashboard/reviews-table";
import { getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function ReviewsPage() {
  const businessId = await requireBusinessId();
  const reviews = await getReviews(businessId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tablero de control de reseñas</h1>
        <p className="mt-1 text-sm text-muted">
          Filtra, revisa el desglose y decide qué reseñas apelar o marcar como resueltas.
        </p>
      </div>

      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
