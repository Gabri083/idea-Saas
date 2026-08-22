"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getCategoryLabels } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function SignupForm({ dict, locale }: { dict: Dictionary["auth"]; locale: Locale }) {
  const router = useRouter();
  const categoryLabels = getCategoryLabels(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.get("business_name"),
          full_name: formData.get("full_name"),
          category: formData.get("category"),
          business_description: formData.get("business_description") || undefined,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.signup.signupFailedError);

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.signup.genericError);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_name" className="text-sm font-medium">
          {dict.signup.businessNameLabel}
        </label>
        <input
          id="business_name"
          name="business_name"
          required
          minLength={2}
          placeholder={dict.signup.businessNamePlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          {dict.signup.categoryLabel}
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        >
          <option value="" disabled>
            {dict.signup.categoryPlaceholder}
          </option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">{dict.signup.categoryHint}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_description" className="text-sm font-medium">
          {dict.signup.descriptionLabel} <span className="text-muted">{dict.signup.descriptionOptional}</span>
        </label>
        <textarea
          id="business_description"
          name="business_description"
          rows={2}
          maxLength={300}
          placeholder={dict.signup.descriptionPlaceholder}
          className="resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          {dict.signup.fullNameLabel}
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          placeholder={dict.signup.fullNamePlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

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
        <label htmlFor="password" className="text-sm font-medium">
          {dict.passwordLabel}
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

      {status === "error" && <p className="text-sm text-rose">{error}</p>}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 w-full">
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> {dict.signup.submitLoading}
          </>
        ) : (
          <>
            <ShieldCheck size={18} /> {dict.signup.submitIdle}
          </>
        )}
      </Button>
    </form>
  );
}
