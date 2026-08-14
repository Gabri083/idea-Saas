import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ReviewForm } from "@/components/review/review-form";
import { resolveBusinessId } from "@/lib/demo";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
            <ShieldCheck size={16} />
          </span>
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Cuéntanos tu experiencia</h1>
          <p className="mt-1 text-sm text-muted">
            Tu voz queda intacta. Una IA calculará una calificación objetiva a partir de los hechos.
          </p>

          <div className="mt-6">
            <ReviewForm businessId={resolveBusinessId(businessId)} />
          </div>
        </div>
      </div>
    </main>
  );
}
