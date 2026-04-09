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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const allFieldsFilled =
    formData.email.trim() !== "" && formData.password !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

      await apiFetch("/api/auth/ensure-profile", { method: "POST" });
      router.push("/");
      router.refresh();
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
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-6">
            Log in to share your music finds
          </p>

          {error && (
            <div className="mb-4 p-4 bg-yellow-500/15 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 rounded-md flex items-center gap-3">
              <span className="text-base shrink-0">⚠</span>
              <p className="font-medium text-base leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
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
                  required
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
                disabled={loading || !allFieldsFilled}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/75 enabled:hover:scale-[1.02] enabled:hover:shadow-md"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
