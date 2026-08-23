import Link from "next/link";
import { ReviewForm } from "@/components/review/review-form";
import { resolveBusinessId } from "@/lib/demo";
import { LogoMark } from "@/components/brand/logo-mark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.publicReview;

  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <LogoMark size={28} />
            Kelsira
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{t.pageTitle}</h1>
          <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>

          <div className="mt-6">
            <ReviewForm businessId={resolveBusinessId(businessId)} dict={t} />
          </div>
        </div>
      </div>
    </main>
  );
}
