import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getDictionary } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.login.pageTitle, description: dict.auth.login.pageDescription };
}

export default async function LoginPage() {
  const dict = await getDictionary();
  return (
    <AuthShell
      title={dict.auth.login.title}
      subtitle={dict.auth.login.subtitle}
      footer={
        <>
          {dict.auth.login.noAccount}{" "}
          <Link href="/signup" className="text-cobalt hover:underline">
            {dict.auth.login.signupLink}
          </Link>
        </>
      }
    >
      <LoginForm dict={dict.auth} />
    </AuthShell>
  );
}
