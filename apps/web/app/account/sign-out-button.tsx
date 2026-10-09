"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message || "Could not sign out. Please try again.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not sign out. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="secondary-button" onClick={signOut} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert" className="auth-error">{error}</p>}
    </div>
  );
}
