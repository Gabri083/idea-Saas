import { NextResponse } from "next/server";
import { getReviews } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const COLUMNS = [
  "Fecha",
  "Cliente",
  "Correo",
  "Reseña",
  "Puntaje cliente",
  "Puntaje IA",
  "Producto",
  "Atención",
  "Envío",
  "Estado",
] as const;

function csvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const reviews = await getReviews(businessId);

  const rows = reviews.map((r) =>
    [
      new Date(r.created_at).toISOString().slice(0, 10),
      r.customer_name,
      r.customer_email,
      r.review_text,
      r.customer_star_rating ?? "",
      r.overall_ai_rating,
      r.product_score ?? "",
      r.service_score ?? "",
      r.delivery_score ?? "",
      r.status,
    ]
      .map(csvField)
      .join(","),
  );

  const csv = [COLUMNS.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resenas-kelsira.csv"`,
    },
  });
}
