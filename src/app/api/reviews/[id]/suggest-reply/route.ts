import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusiness, isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { suggestReply } from "@/lib/ai/reply";
import { mockReviews } from "@/lib/mock-data";
import { hasGrowthAccess } from "@/lib/types";
import type { Review } from "@/lib/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const business = await getBusiness(businessId);
  if (!hasGrowthAccess(business.plan)) {
    return NextResponse.json({ error: "Esto es parte del plan Growth." }, { status: 403 });
  }

  let review: Review | undefined;
  if (!isSupabaseConfigured()) {
    review = mockReviews.find((r) => r.id === id);
  } else {
    const admin = createAdminClient();
    const { data } = await admin
      .from("reviews")
      .select("*")
      .eq("id", id)
      .eq("business_id", businessId)
      .maybeSingle();
    review = (data as Review | null) ?? undefined;
  }
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  }

  try {
    const reply = await suggestReply(review, business);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "No se pudo generar una sugerencia. Intenta de nuevo." }, { status: 500 });
  }
}
