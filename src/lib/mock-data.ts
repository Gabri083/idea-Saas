import { DEMO_BUSINESS_ID } from "@/lib/demo";
import type {
  Appeal,
  Business,
  CalibrationRequest,
  RecurringIssue,
  Review,
  WidgetConfig,
} from "@/lib/types";

/** Mirrors supabase/seed.sql — used as an offline fallback so the dashboard
 * renders real-looking data before Supabase credentials are configured. */

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();
const daysFromNow = (n: number) => new Date(now + n * 86_400_000).toISOString();

export const mockBusiness: Business = {
  id: DEMO_BUSINESS_ID,
  name: "Aurora Studio",
  slug: "aurora-studio",
  contact_email: "hola@aurorastudio.demo",
  plan: "growth",
  monthly_review_cap: null,
  category: "moda_calzado",
  business_description: "Tienda online de ropa y accesorios de diseño independiente.",
  locale: "en",
  lemonsqueezy_customer_id: null,
  lemonsqueezy_subscription_id: null,
  subscription_status: null,
  customer_portal_url: null,
  is_founder: false,
  store_domain: null,
  logo_url: null,
  created_at: daysAgo(120),
};

export const mockReviews: Review[] = [
  {
    id: "33333333-3333-3333-3333-333333333331",
    business_id: DEMO_BUSINESS_ID,
    customer_name: "Camila R.",
    customer_email: "camila@example.com",
    review_text:
      "El producto en sí es hermoso y de muy buena calidad, superó mis expectativas. Pero el envío tardó 3 días más de lo prometido y nadie me avisó, así que le doy 1 estrella porque llegó tarde para el regalo que necesitaba.",
    customer_star_rating: 1,
    product_score: 5,
    service_score: 4,
    delivery_score: 2,
    detected_issues: ["demora en envío", "falta de comunicación de envío"],
    ai_summary: "Producto excelente y atención correcta; la única falla real es el tiempo de entrega.",
    overall_ai_rating: 3.8,
    penalty_applied: 0,
    status: "published",
    business_reply:
      "¡Gracias por tu paciencia, Camila! Hablamos con la empresa de envíos para que esto no se repita y ya ajustamos el proceso de aviso de retrasos.",
    business_reply_at: daysAgo(1),
    created_at: daysAgo(2),
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    business_id: DEMO_BUSINESS_ID,
    customer_name: "Martín G.",
    customer_email: "martin@example.com",
    review_text:
      "Pésimo, llegó todo roto por dentro de la caja, mal embalado. La atención al cliente sí respondió rápido y me ofreció reposición.",
    customer_star_rating: 1,
    product_score: 2,
    service_score: 5,
    delivery_score: 4,
    detected_issues: ["packaging roto"],
    ai_summary: "Falla puntual de empaque; el servicio de atención respondió con rapidez y eficacia.",
    overall_ai_rating: 3.5,
    penalty_applied: 0,
    status: "in_appeal",
    business_reply: null,
    business_reply_at: null,
    created_at: daysAgo(6),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    business_id: DEMO_BUSINESS_ID,
    customer_name: "Sofía P.",
    customer_email: "sofia@example.com",
    review_text:
      "Todo perfecto, tal cual lo pedí, llegó antes de lo esperado y el equipo de soporte fue muy amable resolviendo mi duda sobre la talla.",
    customer_star_rating: 5,
    product_score: 5,
    service_score: 5,
    delivery_score: 5,
    detected_issues: [],
    ai_summary: "Experiencia sobresaliente en las tres dimensiones evaluadas.",
    overall_ai_rating: 5.0,
    penalty_applied: 0,
    status: "published",
    business_reply: null,
    business_reply_at: null,
    created_at: daysAgo(10),
  },
  {
    id: "33333333-3333-3333-3333-333333333334",
    business_id: DEMO_BUSINESS_ID,
    customer_name: "Diego F.",
    customer_email: "diego@example.com",
    review_text:
      "De nuevo la agencia de envíos X entregó con retraso, ya es la cuarta vez que veo esta queja en reseñas de esta tienda. El producto en sí está bien.",
    customer_star_rating: 2,
    product_score: 4,
    service_score: 3,
    delivery_score: 2,
    detected_issues: ["demora en envío", "agencia de envíos recurrente"],
    ai_summary:
      "Producto adecuado, pero se confirma un patrón recurrente y no resuelto de retrasos con la misma agencia de envíos.",
    overall_ai_rating: 2.7,
    penalty_applied: 0.3,
    status: "published",
    business_reply: null,
    business_reply_at: null,
    created_at: daysAgo(1),
  },
];

export const mockRecurringIssues: RecurringIssue[] = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    business_id: DEMO_BUSINESS_ID,
    issue_key: "envio_agencia_x",
    issue_label: "Retrasos recurrentes con la agencia de envíos X",
    occurrences: 4,
    status: "open",
    penalty_factor: 0.3,
    first_detected_at: daysAgo(34),
    resolution_deadline: daysAgo(4),
    resolved_at: null,
    resolution_evidence: null,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    business_id: DEMO_BUSINESS_ID,
    issue_key: "empaque_danado",
    issue_label: "Empaques dañados en tránsito",
    occurrences: 2,
    status: "acknowledged",
    penalty_factor: 0.3,
    first_detected_at: daysAgo(10),
    resolution_deadline: daysFromNow(20),
    resolved_at: null,
    resolution_evidence: null,
  },
];

export const mockAppeals: Appeal[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    review_id: "33333333-3333-3333-3333-333333333332",
    business_id: DEMO_BUSINESS_ID,
    reason:
      "Tenemos capturas del chat de soporte y la guía de reposición enviada el mismo día; el daño fue responsabilidad del transportista, no del empaque original.",
    evidence_urls: [],
    status: "pending",
    resolution_notes: null,
    created_at: daysAgo(5),
    resolved_at: null,
  },
];

export const mockCalibrationRequests: CalibrationRequest[] = [];

export const mockWidgetConfig: WidgetConfig = {
  business_id: DEMO_BUSINESS_ID,
  theme_mode: "light",
  accent_color: "#4f7cff",
  border_radius: "lg",
  font_family: "inter",
  layout: "carousel",
  card_style: "recibo",
  show_breakdown: true,
  show_branding: true,
  review_form_welcome: null,
  review_form_thanks: null,
};
