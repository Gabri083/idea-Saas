"use client";

import { useState } from "react";
import { Loader2, Mail, UserPlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TeamSection({
  initialMembers,
  dict,
}: {
  initialMembers: TeamMember[];
  dict: Dictionary["dashboard"]["team"];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "inviting" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setStatus("inviting");
    setError("");
    try {
      const res = await fetch("/api/business/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.inviteFailedError);
      setStatus("sent");
      setEmail("");
      setMembers((prev) => [
        ...prev,
        {
          id: `pending-${Date.now()}`,
          full_name: null,
          role: "staff",
          email,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.genericError);
      setStatus("error");
    }
  }

  async function remove(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/business/team/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card className="max-w-xl p-6">
      <h2 className="mb-1 text-lg font-medium">{dict.title}</h2>
      <p className="mb-4 text-sm text-muted">{dict.subtitle}</p>

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm">{m.full_name || m.email}</p>
              <p className="truncate text-xs text-muted">{m.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={m.role === "owner" ? "cobalt" : "neutral"}>
                {m.role === "owner" ? dict.ownerLabel : dict.staffLabel}
              </Badge>
              {m.role !== "owner" && (
                <button
                  onClick={() => remove(m.id)}
                  disabled={removingId === m.id}
                  aria-label={dict.removeAria}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose/10 hover:text-rose disabled:opacity-50"
                >
                  {removingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={invite} className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.emailPlaceholder}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
        <Button type="submit" variant="secondary" disabled={status === "inviting"} className="shrink-0">
          {status === "inviting" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {dict.inviting}
            </>
          ) : (
            <>
              <UserPlus size={16} /> {dict.invite}
            </>
          )}
        </Button>
      </form>

      {status === "sent" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald">
          <Mail size={13} /> {dict.inviteSent}
        </p>
      )}
      {status === "error" && <p className="mt-2 text-xs text-rose">{error}</p>}
    </Card>
  );
}
