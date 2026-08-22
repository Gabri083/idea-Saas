import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { LogoMark } from "@/components/brand/logo-mark";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.signup.pageTitle, description: dict.auth.signup.pageDescription };
}

export default async function SignupPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold">
          <LogoMark size={28} />
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{dict.auth.signup.title}</h1>
          <p className="mt-1 text-sm text-muted">{dict.auth.signup.subtitle}</p>

          <div className="mt-6">
            <SignupForm dict={dict.auth} locale={locale} />
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            {dict.auth.signup.haveAccount}{" "}
            <Link href="/login" className="text-cobalt hover:underline">
              {dict.auth.signup.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
