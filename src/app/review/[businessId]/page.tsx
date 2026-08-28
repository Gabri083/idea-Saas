import Link from "next/link";
import Image from "next/image";
import { ReviewForm } from "@/components/review/review-form";
import { resolveBusinessId } from "@/lib/demo";
import { LogoMark } from "@/components/brand/logo-mark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getBusiness, getWidgetConfig } from "@/lib/data";
import { publicPageThemeStyle } from "@/lib/public-page-theme";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId: rawId } = await params;
  const businessId = resolveBusinessId(rawId);
  const [business, config, dict, locale] = await Promise.all([
    getBusiness(businessId),
    getWidgetConfig(businessId),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.publicReview;

  return (
    <main
      className="flex flex-1 flex-col items-center bg-background bg-grid px-4 py-12 text-foreground sm:py-20"
      style={publicPageThemeStyle(config)}
    >
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <LogoMark size={28} />
            Kelsira
          </Link>
          <div className="flex items-center gap-3">
            {business.logo_url && (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={28}
                height={28}
                className="rounded-md object-contain"
              />
            )}
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{t.pageTitle}</h1>
          <p className="mt-1 text-sm text-muted">{config.review_form_welcome || t.pageSubtitle}</p>

          <div className="mt-6">
            <ReviewForm businessId={businessId} thanksMessage={config.review_form_thanks} dict={t} />
          </div>
        </div>
      </div>
    </main>
  );
}
