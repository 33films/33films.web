import AuthForm from "@/components/platform/AuthForm";
import { signUpAction } from "@/app/actions/auth";

export default function RegisterPage() {
  return <AuthForm mode="register" action={signUpAction} />;
}
