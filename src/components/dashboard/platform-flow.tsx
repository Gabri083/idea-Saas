// A simple 4-step flow diagram — not a recreation of Shopify's or WordPress's
// actual admin UI, just an arrows-between-boxes summary of the path described
// in the written steps next to it. `steps` is 4 boxes, each 1-2 short lines.
export function PlatformFlow({ steps }: { steps: [string[], string[], string[], string[]] }) {
  const boxX = [8, 132, 256, 380];
  const boxW = 96;
  const boxY = 24;
  const boxH = 56;

  return (
    <svg viewBox="0 0 480 104" className="h-auto w-full max-w-lg" role="img" aria-hidden="true">
      {steps.map((lines, i) => (
        <g key={i}>
          <rect
            x={boxX[i]}
            y={boxY}
            width={boxW}
            height={boxH}
            rx="8"
            className={i === steps.length - 1 ? "fill-cobalt/10 stroke-cobalt" : "fill-surface-2 stroke-border"}
          />
          {lines.map((line, li) => (
            <text
              key={li}
              x={boxX[i] + boxW / 2}
              y={boxY + boxH / 2 + (li - (lines.length - 1) / 2) * 14 + 4}
              textAnchor="middle"
              fontSize="11"
              className={i === steps.length - 1 ? "fill-cobalt font-medium" : "fill-foreground/85"}
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {[0, 1, 2].map((i) => {
        const x1 = boxX[i] + boxW;
        const x2 = boxX[i + 1];
        const y = boxY + boxH / 2;
        return (
          <g key={i} className="stroke-border">
            <line x1={x1} y1={y} x2={x2 - 6} y2={y} strokeWidth="1.5" />
            <path d={`M ${x2 - 10} ${y - 4} L ${x2 - 2} ${y} L ${x2 - 10} ${y + 4}`} fill="none" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}
