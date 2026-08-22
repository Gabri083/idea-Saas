"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(79,124,255,0.18),transparent)]" />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge tone="cobalt" className="mb-6">
            <Sparkles size={13} /> {dict.badge}
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          {dict.titleLead} <span className="text-gradient">{dict.titleGradient}</span> {dict.titleTail}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-2xl text-balance text-lg text-muted"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <LinkButton href="/signup" size="lg">
            {dict.ctaPrimary} <ArrowRight size={18} />
          </LinkButton>
          <LinkButton href="/review/demo" variant="secondary" size="lg">
            <PlayCircle size={18} /> {dict.ctaSecondary}
          </LinkButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-16 w-full max-w-xl rounded-2xl border border-border bg-surface/70 p-6 text-left shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">{dict.exampleLabel}</p>
              <p className="mt-1 text-sm text-foreground/90">&ldquo;{dict.exampleQuote}&rdquo;</p>
            </div>
          </div>
          <div className="my-4 h-px bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">{dict.scoreLabel}</p>
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={3.8} />
                <span className="text-sm font-semibold text-emerald">3.8/5</span>
              </div>
            </div>
            <Badge tone="amber">{dict.shippingPenalty}</Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
