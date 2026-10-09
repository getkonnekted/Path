import { AuthView } from "@neondatabase/auth-ui";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">PATH<span>.</span></Link>
      <p className="auth-eyebrow">WELCOME BACK</p>
      <h1 className="auth-heading">Continue your journey.</h1>
      <p className="auth-description">Sign in to keep your learning progress with you.</p>
      <div className="auth-card"><AuthView path="sign-in" /></div>
      <p className="auth-switch">New to PATH? <Link href="/auth/sign-up">Create an account</Link></p>
    </main>
  );
}
