import { EmbedReviewShell } from "@/components/review/embed-review-shell";
import { resolveBusinessId } from "@/lib/demo";
import { getBusiness, getWidgetConfig } from "@/lib/data";
import { publicPageThemeStyle } from "@/lib/public-page-theme";
import { getDictionary } from "@/lib/i18n/get-locale";

// A stripped-down copy of /review/[businessId] made for the <iframe> that
// widget-submit.js drops into a merchant's own page (order confirmation,
// account page, etc.) — same real ReviewForm, same theme_mode/accent_color
// a business already configured for its widget, just without the Kelsira
// nav/logo/language switcher, which read as "you left the store's site."
export default async function EmbedReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ name?: string; email?: string; product?: string }>;
}) {
  const { businessId: rawId } = await params;
  const { name, email, product } = await searchParams;
  const businessId = resolveBusinessId(rawId);
  const [business, config, dict] = await Promise.all([
    getBusiness(businessId),
    getWidgetConfig(businessId),
    getDictionary(),
  ]);

  return (
    <div
      className="bg-background px-4 py-4 text-foreground"
      style={publicPageThemeStyle(config)}
    >
      <EmbedReviewShell
        businessId={businessId}
        thanksMessage={config.review_form_thanks}
        dict={dict.publicReview}
        prefillName={name}
        prefillEmail={email}
        productName={product}
      />
      {config.show_branding && (
        <p className="mt-4 text-right text-[10px] opacity-60">{dict.publicReviews.verifiedBadge}</p>
      )}
      <p className="sr-only">{business.name}</p>
    </div>
  );
}
