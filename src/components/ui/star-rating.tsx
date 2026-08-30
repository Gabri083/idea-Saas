import { Star, StarHalf } from "lucide-react";
import { cn, ratingTierColor } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
  /** "review": round to the nearest whole star and color it by quality tier
   * — used for one customer's own rating, where a decimal (from the 3
   * weighted categories) would otherwise show as a near-invisible sliver.
   * "aggregate": proportional fill, snapped to empty/half/full per star so a
   * small partial never disappears, also tier-colored — for a single
   * business-wide number worth showing with more precision. Omit for the
   * original fixed-amber look used everywhere outside /resenas. */
  mode?: "review" | "aggregate";
}

function TieredStar({ size, fillPct, color }: { size: number; fillPct: number; color: string }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <Star size={size} className="absolute inset-0 text-border" fill="none" />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - fillPct}% 0 0)` }}
      >
        <Star size={size} fill={color} stroke={color} />
      </span>
    </span>
  );
}

export function StarRating({ value, size = 18, className, mode }: StarRatingProps) {
  if (mode) {
    const color = ratingTierColor(value);
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {Array.from({ length: 5 }).map((_, i) => {
          let fillPct: number;
          if (mode === "review") {
            fillPct = i < Math.round(value) ? 100 : 0;
          } else {
            const raw = Math.max(0, Math.min(1, value - i));
            fillPct = (raw < 0.25 ? 0 : raw < 0.75 ? 0.5 : 1) * 100;
          }
          return <TieredStar key={i} size={size} fillPct={fillPct} color={color} />;
        })}
      </div>
    );
  }

  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const roundedFull = value - full >= 0.75 ? full + 1 : full;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < roundedFull) {
          return <Star key={i} size={size} className="fill-amber text-amber" />;
        }
        if (hasHalf && i === roundedFull) {
          return <StarHalf key={i} size={size} className="fill-amber text-amber" />;
        }
        return <Star key={i} size={size} className="text-border" />;
      })}
    </div>
  );
}
