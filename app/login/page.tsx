import AuthForm from "@/components/platform/AuthForm";
import { signInAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" action={signInAction} nextPath={next ?? ""} />;
}
