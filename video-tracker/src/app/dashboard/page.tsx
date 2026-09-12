import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardSummary, fetchVideos, effectivePrice } from "@/lib/data";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { StatusBadge, PaymentBadge } from "@/components/videos/status-badges";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [summary, recentVideos] = await Promise.all([
    fetchDashboardSummary(supabase),
    fetchVideos(supabase),
  ]);

  const recent = recentVideos.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Resumen</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vista general de la producción de reels y los pagos a editores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Reels este mes"
          value={String(summary.reelsThisMonth)}
          hint="Videos creados este mes"
        />
        <SummaryCard
          label="Completados"
          value={String(summary.completedThisMonth)}
          hint="Aprobados o publicados"
        />
        <SummaryCard
          label="Por pagar"
          value={formatCurrency(summary.amountOwed)}
          hint={`${summary.videosOwedCount} video(s) sin pagar`}
        />
        <SummaryCard
          label="Pagado este mes"
          value={formatCurrency(summary.paidThisMonth)}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Últimos reels
          </h2>
          <Link
            href="/dashboard/videos"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Referencia</th>
                <th className="px-5 py-3 font-medium">Editor</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Pago</th>
                <th className="px-5 py-3 font-medium">Monto</th>
                <th className="px-5 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    Aún no hay reels registrados.
                  </td>
                </tr>
              )}
              {recent.map((video) => (
                <tr key={video.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {video.reference}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {video.editor?.name ?? "Sin asignar"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={video.status} />
                  </td>
                  <td className="px-5 py-3">
                    <PaymentBadge status={video.payment_status} />
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatCurrency(effectivePrice(video))}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(video.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
