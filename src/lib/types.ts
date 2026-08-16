export type Plan = "free" | "starter" | "growth" | "enterprise";

/** null = unlimited. Single source of truth, used at signup, checkout webhook, and submit-time enforcement. */
export const PLAN_REVIEW_CAP: Record<Plan, number | null> = {
  free: 20,
  starter: 200,
  growth: null,
  enterprise: null,
};

/** Consultor IA, Centro de Calibración, and widget personalization are Growth+ per the pricing page. */
export function hasGrowthAccess(plan: Plan): boolean {
  return plan === "growth" || plan === "enterprise";
}

export type ReviewStatus = "published" | "in_appeal" | "resolved" | "archived";

export type BusinessCategory =
  | "restaurante"
  | "moda_calzado"
  | "belleza"
  | "electronica"
  | "hogar"
  | "salud"
  | "otro";

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  restaurante: "Restaurante / Comida",
  moda_calzado: "Moda y calzado",
  belleza: "Belleza y cuidado personal",
  electronica: "Electrónica y tecnología",
  hogar: "Hogar y decoración",
  salud: "Salud y bienestar",
  otro: "Otro",
};

export interface Business {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  plan: Plan;
  monthly_review_cap: number | null;
  category: BusinessCategory | null;
  business_description: string | null;
  lemonsqueezy_customer_id: string | null;
  lemonsqueezy_subscription_id: string | null;
  subscription_status: string | null;
  customer_portal_url: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  review_text: string;
  customer_star_rating: number | null;
  product_score: number;
  service_score: number;
  delivery_score: number;
  detected_issues: string[];
  ai_summary: string | null;
  overall_ai_rating: number;
  penalty_applied: number;
  status: ReviewStatus;
  created_at: string;
}

export type RecurringIssueStatus = "open" | "acknowledged" | "resolved";

export interface RecurringIssue {
  id: string;
  business_id: string;
  issue_key: string;
  issue_label: string;
  occurrences: number;
  status: RecurringIssueStatus;
  penalty_factor: number;
  first_detected_at: string;
  resolution_deadline: string;
  resolved_at: string | null;
  resolution_evidence: string | null;
}

export type AppealStatus = "pending" | "approved" | "rejected";

export interface Appeal {
  id: string;
  review_id: string;
  business_id: string;
  reason: string;
  evidence_urls: string[];
  status: AppealStatus;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export type CalibrationStatus = "pending" | "approved" | "rejected";

export interface CalibrationRequest {
  id: string;
  business_id: string;
  recurring_issue_id: string;
  affected_review_ids: string[];
  evidence: string;
  status: CalibrationStatus;
  requested_at: string;
  resolved_at: string | null;
}

export interface WidgetConfig {
  business_id: string;
  theme_mode: "light" | "dark";
  accent_color: string;
  border_radius: "none" | "sm" | "md" | "lg" | "full";
  font_family: string;
  layout: "carousel" | "badge" | "grid" | "wall" | "spotlight";
  show_breakdown: boolean;
  show_branding: boolean; // "Verificado por Kelsira" footer; forced true on free/starter regardless of this value
}

export type TeamRole = "owner" | "staff";

export interface TeamMember {
  id: string;
  full_name: string | null;
  role: TeamRole;
  email: string;
  created_at: string;
}

/** Structured output contract for the OpenAI JSON-mode scoring call. */
export interface AiReviewAnalysis {
  product_score: number;
  service_score: number;
  delivery_score: number;
  detected_issues: string[];
  summary: string;
}
