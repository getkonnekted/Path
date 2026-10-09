import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { data, error } = await auth.getSession();
  if (error || !data?.user) redirect("/auth/sign-in");

  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">PATH<span>.</span></Link>
      <p className="auth-eyebrow">YOUR ACCOUNT</p>
      <h1 className="auth-heading">Welcome back.</h1>
      <p className="auth-description">
        Signed in as <strong>{data.user.email}</strong>. Your account is ready.
      </p>
      <div className="auth-card">
        <h2>Keep learning</h2>
        <p className="auth-description">Your current lesson progress is still saved on this device. Cloud progress sync is the next step; this page does not claim it is active yet.</p>
        <Link className="primary-link" href="/path/life-of-david">Continue The Life of David ↗</Link>
        <div style={{ marginTop: 20 }}><SignOutButton /></div>
      </div>
    </main>
  );
}
