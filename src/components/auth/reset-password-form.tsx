"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ResetPasswordForm({ dict }: { dict: Dictionary["auth"] }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    // The recovery/invite link puts a token in the URL hash; the browser
    // client picks it up automatically and fires this once a session exists.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setReady((r) => {
        if (!r) setLinkInvalid(true);
        return r;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const confirm = String(formData.get("confirm"));

    if (password !== confirm) {
      setError(dict.resetPassword.mismatchError);
      setStatus("error");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(dict.resetPassword.updateError);
      setStatus("error");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (linkInvalid) {
    return (
      <p className="text-sm text-rose">
        {dict.resetPassword.invalidLinkPrefix}{" "}
        <a href="/forgot-password" className="text-cobalt hover:underline">
          {dict.resetPassword.invalidLinkCta}
        </a>
        .
      </p>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> {dict.resetPassword.verifying}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          {dict.resetPassword.newPasswordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder={dict.passwordPlaceholderMin8}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-medium">
          {dict.resetPassword.confirmLabel}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          placeholder={dict.resetPassword.confirmPlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 w-full">
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> {dict.resetPassword.submitLoading}
          </>
        ) : (
          <>
            <KeyRound size={18} /> {dict.resetPassword.submitIdle}
          </>
        )}
      </Button>
    </form>
  );
}
