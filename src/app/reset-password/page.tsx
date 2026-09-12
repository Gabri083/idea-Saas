import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function ResetPasswordPage() {
  const dict = await getDictionary();
  return (
    <AuthShell title={dict.auth.resetPassword.title} subtitle={dict.auth.resetPassword.subtitle}>
      <ResetPasswordForm dict={dict.auth} />
    </AuthShell>
  );
}
