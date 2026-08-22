import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LogoMark } from "@/components/brand/logo-mark";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function ResetPasswordPage() {
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold">
          <LogoMark size={28} />
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{dict.auth.resetPassword.title}</h1>
          <p className="mt-1 text-sm text-muted">{dict.auth.resetPassword.subtitle}</p>

          <div className="mt-6">
            <ResetPasswordForm dict={dict.auth} />
          </div>
        </div>
      </div>
    </main>
  );
}
