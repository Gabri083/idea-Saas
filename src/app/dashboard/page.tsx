import Link from "next/link";
import { Sparkles, Star, MessagesSquare, AlertTriangle, ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getBusiness, getRecurringIssues, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { formatDate, isPastDeadline } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const businessId = await requireBusinessId();
  const [business, reviews, recurringIssues] = await Promise.all([
    getBusiness(businessId),
    getReviews(businessId),
    getRecurringIssues(businessId),
  ]);

  // UTC to match the cap enforcement in /api/reviews.
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const usedThisMonth = reviews.filter((r) => new Date(r.created_at) >= startOfMonth).length;

  const avgAi = average(reviews.map((r) => r.overall_ai_rating));
  const customerRated = reviews.filter((r) => r.customer_star_rating != null);
  const avgCustomer = average(customerRated.map((r) => r.customer_star_rating!));
  const openAlerts = recurringIssues.filter(
    (i) => i.status === "open" && isPastDeadline(i.resolution_deadline),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="mt-1 text-sm text-muted">
          El pulso de tu reputación objetiva, en un vistazo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Sparkles}
          tone="cobalt"
          label="Promedio IA"
          value={`${avgAi.toFixed(1)}★`}
          hint="Calculado por hechos, sin sesgo emocional"
        />
        <MetricCard
          icon={Star}
          tone="amber"
          label="Promedio Cliente"
          value={customerRated.length ? `${avgCustomer.toFixed(1)}★` : "—"}
          hint="Lo que hubieran calificado en caliente"
        />
        <MetricCard
          icon={MessagesSquare}
          label="Total de reseñas"
          value={String(reviews.length)}
          hint="Todas las reseñas recibidas"
        />
        <MetricCard
          icon={AlertTriangle}
          tone={openAlerts.length > 0 ? "amber" : "emerald"}
          label="Alertas operativas"
          value={String(openAlerts.length)}
          hint="Problemas recurrentes fuera de plazo"
        />
      </div>

      <PlanUsageCard used={usedThisMonth} cap={business.monthly_review_cap} />

      {openAlerts.length > 0 && (
        <Card className="border-amber/30 bg-amber/[0.05] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {openAlerts.length} problema{openAlerts.length > 1 ? "s" : ""} operativo
                {openAlerts.length > 1 ? "s" : ""} sin resolver está{openAlerts.length > 1 ? "n" : ""}{" "}
                penalizando tus nuevas reseñas
              </p>
              <p className="mt-1 text-sm text-muted">
                {openAlerts.map((i) => i.issue_label).join(" · ")}
              </p>
            </div>
            <Link
              href="/dashboard/consultant"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber hover:underline"
            >
              Ver consultor IA <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Reseñas recientes</h2>
          <Link href="/dashboard/reviews" className="text-sm text-cobalt hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {reviews.slice(0, 4).map((review) => (
            <Card key={review.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{review.customer_name}</p>
                  <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
                  {review.status === "in_appeal" && <Badge tone="amber">En apelación</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{review.review_text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StarRating value={review.overall_ai_rating} size={14} />
                <span className="text-sm font-semibold">{review.overall_ai_rating.toFixed(1)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
