import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function LegalTitle({ children, updated }: { children: React.ReactNode; updated: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight">{children}</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: {updated}</p>
    </div>
  );
}

export function H2({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("mt-10 mb-3 text-xl font-medium first:mt-0", className)} {...props} />;
}

export function P({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mb-4 text-sm leading-relaxed text-foreground/85", className)} {...props} />;
}

export function Ul({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("mb-4 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85", className)} {...props} />
  );
}

export function Li({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("ml-5 list-disc marker:text-cobalt", className)} {...props} />
  );
}
