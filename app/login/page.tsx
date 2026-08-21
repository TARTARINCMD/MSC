"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-fetch";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allFieldsFilled =
    formData.email.trim() !== "" && formData.password !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signError) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Fire ensure-profile but don't block navigation on it
      apiFetch("/api/auth/ensure-profile", { method: "POST" }).catch(() => {});
      router.push("/");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Always report success — never reveal whether an account exists.
      setResetSent(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-base text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to home
        </Link>

        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            {resetMode ? "Reset password" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {resetMode
              ? "We'll email you a link to set a new password."
              : "Log in to share your music finds"}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-yellow-500/15 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 rounded-md flex items-center gap-3">
              <span className="text-base shrink-0">⚠</span>
              <p className="font-medium text-base leading-snug">{error}</p>
            </div>
          )}

          {resetSent ? (
            <div className="space-y-4">
              <div
                role="status"
                className="p-4 bg-primary/10 border border-primary/30 rounded-md"
              >
                <p className="font-medium mb-1">Check your inbox</p>
                <p className="text-sm text-muted-foreground leading-snug">
                  If an account exists for {formData.email}, a reset link is on
                  its way. The link expires in one hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetMode(false);
                  setResetSent(false);
                }}
                className="w-full border border-border py-2 rounded-md font-medium transition-colors hover:bg-muted"
              >
                Back to log in
              </button>
            </div>
          ) : (
          <form onSubmit={resetMode ? handleReset : handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Your email address"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>

            <div className={resetMode ? "hidden" : undefined}>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!resetMode}
                  placeholder="Your password"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <button
                type="submit"
                disabled={
                  loading ||
                  (resetMode ? formData.email.trim() === "" : !allFieldsFilled)
                }
                className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/75 enabled:hover:scale-[1.02] enabled:hover:shadow-md"
              >
                {loading
                  ? resetMode
                    ? "Sending..."
                    : "Logging in..."
                  : resetMode
                    ? "Send reset link"
                    : "Log in"}
              </button>
            </div>
          </form>
          )}

          {!resetSent && (
            <div className="mt-3 text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(!resetMode);
                    setError("");
                  }}
                  className="text-primary hover:underline"
                >
                  {resetMode ? "Back to log in" : "Forgot password?"}
                </button>
              </p>
              {!resetMode && (
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
