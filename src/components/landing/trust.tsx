import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Trust({ dict }: { dict: Dictionary["trust"] }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-10">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted">{dict.heading}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-11 gap-y-3 opacity-60">
        {dict.platforms.map((platform) => (
          <span key={platform} className="text-base font-bold text-muted">
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
}
