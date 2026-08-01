"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertOctagon, CheckCircle2, Clock, History, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { daysUntil, formatDate } from "@/lib/utils";
import type { RecurringIssue } from "@/lib/types";

export function ConsultantPanel({ issues: initialIssues }: { issues: RecurringIssue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function acknowledge(id: string) {
    setPendingId(id);
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "acknowledged" } : i)));
    try {
      await fetch(`/api/recurring-issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "acknowledged" }),
      });
    } finally {
      setPendingId(null);
    }
  }

  if (issues.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <TrendingUp size={24} className="text-emerald" />
        <p className="text-sm font-medium">Sin cuellos de botella detectados</p>
        <p className="text-sm text-muted">
          Cuando la IA detecte fallas recurrentes en tus reseñas, aparecerán aquí con un
          temporizador de resolución de 30 días.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {issues.map((issue) => {
        const remaining = daysUntil(issue.resolution_deadline);
        const overdue = remaining < 0 && issue.status !== "resolved";

        return (
          <Card
            key={issue.id}
            className={overdue ? "border-amber/30 bg-amber/[0.04] p-6" : "p-6"}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={16} className={overdue ? "text-amber" : "text-muted"} />
                  <p className="font-medium">{issue.issue_label}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Se detectaron {issue.occurrences} quejas relacionadas · primera vez{" "}
                  {formatDate(issue.first_detected_at)}
                </p>
              </div>

              <Badge
                tone={issue.status === "resolved" ? "emerald" : issue.status === "acknowledged" ? "cobalt" : "amber"}
              >
                {issue.status === "resolved"
                  ? "Resuelto"
                  : issue.status === "acknowledged"
                    ? "Reconocido"
                    : "Abierto"}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-4 py-3 text-sm">
              <Clock size={15} className={overdue ? "text-amber" : "text-muted"} />
              {overdue ? (
                <span className="text-amber">
                  Plazo vencido hace {Math.abs(remaining)} días — las nuevas reseñas relacionadas
                  reciben una penalización de -{issue.penalty_factor} estrellas.
                </span>
              ) : (
                <span className="text-muted">
                  {remaining} días para solucionar este cuello de botella antes de que afecte la
                  ponderación de futuras reseñas.
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {issue.status === "open" && (
                <button
                  disabled={pendingId === issue.id}
                  onClick={() => acknowledge(issue.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cobalt/30 bg-cobalt/10 px-3 py-1.5 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt/20 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} /> Reconocer problema
                </button>
              )}
              <Link
                href={`/dashboard/calibration?issueId=${issue.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
              >
                <History size={14} /> Solicitar calibración con evidencia
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
