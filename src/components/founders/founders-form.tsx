"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getCategoryLabels, PLAN_PRICES } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type FoundersDict = Dictionary["founders"];

const platforms = ["shopify", "woocommerce", "other"] as const;
const plans = ["starter", "growth", "enterprise"] as const;

const inputClass =
  "rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2";

export function FoundersForm({ dict, soldOut, locale }: { dict: FoundersDict; soldOut: boolean; locale: Locale }) {
  const categoryLabels = getCategoryLabels(locale);
  const [status, setStatus] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [startedAt] = useState(() => Date.now());

  async function handleWaitlistSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/founders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: "N/A",
          email: formData.get("email"),
          platform: "other",
          website: formData.get("website") || "",
          started_at: startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.unexpectedError);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.unexpectedError);
      setStatus("error");
    }
  }

  async function handlePurchaseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const res = await fetch("/api/founders/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.get("business_name"),
          full_name: formData.get("full_name"),
          email,
          password,
          category: formData.get("category"),
          store_domain: formData.get("store_domain"),
          platform: formData.get("platform"),
          plan: formData.get("plan"),
          website: formData.get("website") || "",
          started_at: startedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.unexpectedError);

      // Sign in client-side so the account is already authenticated when
      // Lemon Squeezy redirects back to /dashboard/settings after payment.
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      window.location.href = data.checkout_url;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.unexpectedError);
      setStatus("error");
    }
  }

  if (soldOut) {
    if (status === "done") {
      return (
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
            <Check size={20} />
          </span>
          <p className="text-base font-semibold">{dict.soldOutTitle}</p>
          <p className="text-sm text-muted">{dict.soldOutBody}</p>
        </Card>
      );
    }

    return (
      <Card className="p-6 text-center">
        <p className="text-base font-semibold">{dict.soldOutTitle}</p>
        <p className="mt-1.5 text-sm text-muted">{dict.soldOutBody}</p>
        <form onSubmit={handleWaitlistSubmit} className="mt-5 flex flex-col gap-3 text-left">
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input
            name="email"
            type="email"
            required
            placeholder={dict.formEmailPlaceholder}
            className={inputClass}
          />
          {status === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {errorMessage}
            </div>
          )}
          <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
            {status === "submitting" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> {dict.submitting}
              </>
            ) : (
              dict.submit
            )}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handlePurchaseSubmit} className="flex flex-col gap-4">
        {/* Honeypot: hidden from real users, bots tend to fill every field. */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="business_name" className="text-sm font-medium">
              {dict.formBusinessName}
            </label>
            <input
              id="business_name"
              name="business_name"
              required
              maxLength={120}
              placeholder={dict.formBusinessNamePlaceholder}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-sm font-medium">
              {dict.formFullName}
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              maxLength={120}
              placeholder={dict.formFullNamePlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              {dict.formEmail}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={dict.formEmailPlaceholder}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {dict.formPassword}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder={dict.formPasswordPlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium">
            {dict.formCategory}
          </label>
          <select id="category" name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {dict.formCategoryPlaceholder}
            </option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="store_domain" className="text-sm font-medium">
            {dict.formStoreUrl}
          </label>
          <input
            id="store_domain"
            name="store_domain"
            required
            maxLength={200}
            placeholder={dict.formStoreUrlPlaceholder}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{dict.formPlatform}</span>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-border px-2 py-2.5 text-xs text-muted transition-colors has-[:checked]:border-cobalt/40 has-[:checked]:bg-cobalt/10 has-[:checked]:text-cobalt"
              >
                <input type="radio" name="platform" value={p} required defaultChecked={p === "shopify"} className="sr-only" />
                {p === "shopify" ? dict.platformShopify : p === "woocommerce" ? dict.platformWoocommerce : dict.platformOther}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{dict.formPlan}</span>
          <div className="grid grid-cols-3 gap-2">
            {plans.map((p) => {
              const price = PLAN_PRICES[p];
              const discounted = (price * 0.7).toFixed(2);
              const label = p === "starter" ? dict.planStarter : p === "growth" ? dict.planGrowth : dict.planEnterprise;
              return (
                <label
                  key={p}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-border px-2 py-3 text-center transition-colors has-[:checked]:border-cobalt/40 has-[:checked]:bg-cobalt/10"
                >
                  <input type="radio" name="plan" value={p} required defaultChecked={p === "growth"} className="sr-only" />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                  <span className="text-[11px] text-muted line-through">
                    {dict.planPriceTemplate.replace("{price}", `$${price}`)}
                  </span>
                  <span className="text-xs font-semibold text-cobalt">
                    {dict.planDiscountedTemplate.replace("{price}", `$${discounted}`)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            {errorMessage}
          </div>
        )}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {dict.submitting}
            </>
          ) : (
            dict.submit
          )}
        </Button>

        <p className="text-center text-xs text-muted">
          {dict.reassurance1} {dict.reassurance2}
        </p>
      </form>
    </Card>
  );
}
