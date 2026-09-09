import { SubmitWidgetMount } from "@/components/review/submit-widget-mount";
import { resolveBusinessId } from "@/lib/demo";

// A blank page standing in for "a merchant's own storefront" — the ONLY
// thing on it is the exact <script> snippet copied from the dashboard, so
// what renders here (trigger button, modal, launcher bubble, and what's
// inside them) is pixel-for-pixel what a real visitor would see, not a
// hand-built illustration that can drift out of sync with widget-submit.js.
// Meant to live inside an <iframe> on /dashboard/widget, never linked to
// directly — position:fixed inside widget-submit.js's modal/launcher styles
// stays scoped to this page's own viewport rather than the dashboard's.
export default async function PreviewSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ style?: string }>;
}) {
  const { businessId: rawId } = await params;
  const { style } = await searchParams;
  const businessId = resolveBusinessId(rawId);
  const embedStyle = style === "modal" || style === "lanzador" ? style : "inline";

  return <SubmitWidgetMount businessId={businessId} style={embedStyle} />;
}
