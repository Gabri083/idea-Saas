"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ForgotPasswordForm({ dict }: { dict: Dictionary["auth"] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(dict.forgotPassword.error);
      setStatus("error");
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm text-emerald">
        <CheckCircle2 size={16} className="shrink-0" />
        {dict.forgotPassword.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {dict.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={dict.emailPlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 w-full">
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> {dict.forgotPassword.submitLoading}
          </>
        ) : (
          <>
            <Mail size={18} /> {dict.forgotPassword.submitIdle}
          </>
        )}
      </Button>
    </form>
  );
}
