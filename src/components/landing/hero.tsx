"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, PlayCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-180px] left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,124,255,0.16),transparent)] blur-[10px]" />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 pb-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm text-muted"
        >
          <span className="rounded-full bg-cobalt px-2.5 py-1 text-xs font-semibold text-white">New</span>
          {dict.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
        >
          {dict.titleLead} {dict.titleGradient} {dict.titleTail}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance mt-5 max-w-xl text-lg leading-relaxed text-muted"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <LinkButton href="/signup" size="lg" className="rounded-full">
            {dict.ctaPrimary} <ArrowRight size={18} />
          </LinkButton>
          <LinkButton href="/review/demo" variant="outline" size="lg" className="rounded-full">
            <PlayCircle size={18} /> {dict.ctaSecondary}
          </LinkButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted"
        >
          {dict.checks.map((check) => (
            <span key={check} className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-emerald" /> {check}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto max-w-4xl px-6"
      >
        <div className="relative h-[280px] max-sm:h-[400px]">
          <div className="absolute left-[2%] top-0 w-[230px] rounded-2xl border border-border bg-background p-5 shadow-[0_24px_48px_-20px_rgba(20,21,26,0.16)] max-sm:left-1/2 max-sm:-translate-x-1/2">
            <p className="text-[11.5px] font-medium text-muted">{dict.recoveredCardLabel}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{dict.recoveredCardValue}</span>
              <span className="rounded-md bg-emerald/10 px-1.5 py-0.5 text-xs font-semibold text-emerald">
                ▲ {dict.recoveredCardTag}
              </span>
            </div>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="mt-2.5 h-10 w-full">
              <polyline
                points="0,32 30,28 60,30 90,18 120,22 150,10 180,14 200,6"
                fill="none"
                stroke="var(--color-cobalt)"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="absolute right-[1%] top-[30px] w-[260px] rounded-2xl border border-border bg-background p-5 text-left shadow-[0_24px_48px_-20px_rgba(20,21,26,0.16)] max-sm:left-1/2 max-sm:right-auto max-sm:top-[220px] max-sm:-translate-x-1/2">
            <p className="text-[11.5px] font-medium text-muted">{dict.exampleLabel}</p>
            <blockquote className="mt-2 text-[13.5px] leading-relaxed">&ldquo;{dict.exampleQuote}&rdquo;</blockquote>
            <div className="my-3 h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted">{dict.scoreLabel}</p>
                <p className="text-[22px] font-extrabold text-emerald">3.8/5</p>
              </div>
              <span className="rounded-md border border-rose/30 bg-rose/10 px-2 py-1 text-xs font-semibold text-rose">
                {dict.shippingPenalty}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
