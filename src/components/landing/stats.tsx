import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Stats({ dict }: { dict: Dictionary["stats"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold text-cobalt">{dict.eyebrow}</p>
        <h2 className="text-balance mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.title}</h2>
      </div>

      <div className="mt-11 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dict.items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-3xl font-extrabold tracking-tight">{item.value}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
