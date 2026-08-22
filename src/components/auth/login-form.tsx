"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({ dict }: { dict: Dictionary["auth"] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(dict.login.error);
      setStatus("error");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            {dict.passwordLabel}
          </label>
          <a href="/forgot-password" className="text-xs text-cobalt hover:underline">
            {dict.login.forgotPassword}
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder={dict.login.passwordPlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 w-full">
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> {dict.login.submitLoading}
          </>
        ) : (
          <>
            <LogIn size={18} /> {dict.login.submitIdle}
          </>
        )}
      </Button>
    </form>
  );
}
