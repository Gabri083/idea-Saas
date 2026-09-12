import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/videos", label: "Reels" },
  { href: "/dashboard/editors", label: "Editores" },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 py-6">
      <div>
        <p className="px-2 text-sm font-semibold text-slate-900">
          Video Tracker
        </p>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action={logout}>
        <Button type="submit" variant="ghost" className="w-full justify-start px-2">
          Cerrar sesión
        </Button>
      </form>
    </aside>
  );
}
