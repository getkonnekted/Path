import { AuthView } from "@neondatabase/auth-ui";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">PATH<span>.</span></Link>
      <p className="auth-eyebrow">START YOUR JOURNEY</p>
      <h1 className="auth-heading">Make room to remember.</h1>
      <p className="auth-description">Create an account for a learning journey that can follow you across devices.</p>
      <div className="auth-card"><AuthView path="sign-up" /></div>
      <p className="auth-switch">Already have an account? <Link href="/auth/sign-in">Sign in</Link></p>
    </main>
  );
}
