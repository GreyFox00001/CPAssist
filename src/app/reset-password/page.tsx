"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";

import { AuthPageShell } from "@/components/blocks/auth-page-shell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const supabase = createClient();
      const { data, error: sessionError } = await supabase.auth.getUser();

      if (!mounted) return;

      if (sessionError || !data.user) {
        setError("Your password reset link is invalid or expired. Request a new reset link.");
      }

      setIsCheckingSession(false);
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || "Could not update password.");
        return;
      }

      await supabase.auth.signOut();
      setSuccessMessage("Password updated successfully. Redirecting to login...");
      window.setTimeout(() => router.replace("/login"), 1500);
    } catch {
      setError("Could not update password. Please request a new reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-input bg-muted/50 py-3 pr-12 pl-10 placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <AuthPageShell
      backgroundClassName="bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.16),_transparent_35%),linear-gradient(180deg,_var(--background),_color-mix(in_oklab,var(--background)_85%,white))]"
      gridClassName="lg:grid-cols-[0.9fr_1.1fr]"
    >
      <section className="space-y-6">
        <div className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
          Account recovery
        </div>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose a new password for your CPAssist account.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            This page only works from a valid password reset link sent to your email.
          </p>
        </div>
      </section>

      <section className="rounded-4xl border border-border/70 bg-background/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="mb-8 text-center">
          <KeyRound className="mx-auto mb-3 h-12 w-12 text-primary" />
          <h2 className="mb-2 text-2xl font-bold">Reset Password</h2>
          <p className="text-muted-foreground">Enter and confirm your new password.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/20 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-400/30 bg-green-500/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-300" />
            <span className="text-sm text-green-700 dark:text-green-300">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isCheckingSession || isSubmitting || Boolean(successMessage)}
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isCheckingSession || isSubmitting || Boolean(successMessage)}
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isCheckingSession || isSubmitting || Boolean(successMessage)}
            className="w-full rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              {isSubmitting || isCheckingSession ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Need a new link?{" "}
          <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
            Return to login
          </Link>
        </div>
      </section>
    </AuthPageShell>
  );
}
