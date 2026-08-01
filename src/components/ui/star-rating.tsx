import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

export function StarRating({ value, size = 18, className }: StarRatingProps) {
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
