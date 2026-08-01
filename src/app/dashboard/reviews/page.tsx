import { ReviewsTable } from "@/components/dashboard/reviews-table";
import { getReviews } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function ReviewsPage() {
  const reviews = await getReviews(DEMO_BUSINESS_ID);

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
