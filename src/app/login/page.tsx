import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu dashboard de Kelsira.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
            <ShieldCheck size={16} />
          </span>
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Inicia sesión</h1>
          <p className="mt-1 text-sm text-muted">Entra a tu dashboard.</p>

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-cobalt hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
