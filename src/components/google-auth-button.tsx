"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#4285F4" d="M12 10.2v3.9h5.4c-.2 1.1-.9 2.1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-4 2.7-6.8 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 21.9c2.4 0 4.4-.8 5.9-2.1l-2.9-2.2c-.8.5-1.8.8-3 .8-2.3 0-4.2-1.6-4.9-3.8H4.1v2.4C5.5 19.6 8.5 21.9 12 21.9z" />
      <path fill="#FBBC05" d="M7.1 14.6c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V8.6H4.1c-.6 1.2-.9 2.5-.9 4.2 0 1.6.3 3 .9 4.2l3-2.4z" />
      <path fill="#EA4335" d="M12 5.1c1.3 0 2.5.4 3.5 1.3l2.7-2.7C16.4 2.1 14.4 1.2 12 1.2 8.5 1.2 5.5 3.5 4.1 6.8l3 2.4C7.8 6.7 9.7 5.1 12 5.1z" />
    </svg>
  );
}

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) throw authError;
      
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "Failed to authenticate with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="h-11 w-full justify-center gap-3 border-border/80 bg-background/90 text-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/60"
      >
        {isLoading ? (
          <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.2" />
            <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        ) : (
          <GoogleLogo />
        )}
        <span>{isLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}