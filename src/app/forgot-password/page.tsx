import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function ForgotPasswordPage() {
  const dict = await getDictionary();
  return (
    <AuthShell
      title={dict.auth.forgotPassword.title}
      subtitle={dict.auth.forgotPassword.subtitle}
      footer={
        <Link href="/login" className="text-cobalt hover:underline">
          {dict.auth.forgotPassword.backToLogin}
        </Link>
      }
    >
      <ForgotPasswordForm dict={dict.auth} />
    </AuthShell>
  );
}
