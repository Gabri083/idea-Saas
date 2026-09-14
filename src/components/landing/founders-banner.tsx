import Link from "next/link";
import { getFounderStatus } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The only place on the public site that surfaces the Founders offer besides
 * /fundadores itself — without this, someone landing on the homepage (e.g.
 * from a cold email that mentions "30% off") would have no way to find it,
 * since no nav link or footer link points there. Hidden once the 40 spots
 * are gone, using the same real, verifiable count /fundadores itself uses.
 */
export async function FoundersBanner({ dict }: { dict: Pick<Dictionary["founders"], "bannerText" | "bannerCta"> }) {
  const status = await getFounderStatus();
  if (status.soldOut) return null;

  return (
    <Link
      href="/fundadores"
      className="block border-b border-cobalt/20 bg-cobalt/5 px-4 py-2.5 text-center text-[13px] transition-colors hover:bg-cobalt/10"
    >
      <span className="text-foreground/85">{dict.bannerText}</span>{" "}
      <span className="font-semibold text-cobalt underline underline-offset-2">{dict.bannerCta}</span>
    </Link>
  );
}
