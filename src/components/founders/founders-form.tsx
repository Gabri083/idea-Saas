"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FoundersDict = Dictionary["founders"];

const platforms = ["shopify", "woocommerce", "other"] as const;

export function FoundersForm({ dict, soldOut }: { dict: FoundersDict; soldOut: boolean }) {
  const [status, setStatus] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [wasSoldOut, setWasSoldOut] = useState(false);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/founders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.get("business_name"),
          email: formData.get("email"),
          store_domain: formData.get("store_domain") || undefined,
          platform: formData.get("platform"),
          website: formData.get("website") || "",
          started_at: startedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.unexpectedError);

      setWasSoldOut(Boolean(data.sold_out));
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.unexpectedError);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
          <Check size={20} />
        </span>
        <p className="text-base font-semibold">{wasSoldOut ? dict.soldOutTitle : dict.successTitle}</p>
        <p className="text-sm text-muted">{wasSoldOut ? dict.soldOutBody : dict.successBody}</p>
        {!wasSoldOut && (
          <a
            href="/signup"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cobalt px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cobalt-dim"
          >
            {dict.goToSignupCta}
            <ArrowRight size={16} />
          </a>
        )}
      </Card>
    );
  }

  if (soldOut) {
    return (
      <Card className="p-6 text-center">
        <p className="text-base font-semibold">{dict.soldOutTitle}</p>
        <p className="mt-1.5 text-sm text-muted">{dict.soldOutBody}</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 text-left">
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="business_name" value="N/A" />
          <input type="hidden" name="platform" value="other" />
          <input
            name="email"
            type="email"
            required
            placeholder={dict.formEmailPlaceholder}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Honeypot: hidden from real users, bots tend to fill every field. */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

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
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
        </div>

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
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
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
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
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

        <p className="text-center text-xs text-muted">{dict.reassurance1}</p>
      </form>
    </Card>
  );
}
