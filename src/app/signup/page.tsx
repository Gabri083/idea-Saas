import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.signup.pageTitle, description: dict.auth.signup.pageDescription };
}

export default async function SignupPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <AuthShell
      title={dict.auth.signup.title}
      subtitle={dict.auth.signup.subtitle}
      footer={
        <>
          {dict.auth.signup.haveAccount}{" "}
          <Link href="/login" className="text-cobalt hover:underline">
            {dict.auth.signup.loginLink}
          </Link>
        </>
      }
    >
      <SignupForm dict={dict.auth} locale={locale} />
    </AuthShell>
  );
}
