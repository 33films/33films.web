import AuthForm from "@/components/platform/AuthForm";
import { resetPasswordAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" action={resetPasswordAction} />;
}
