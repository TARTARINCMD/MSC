"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-fetch";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const allFieldsFilled =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password !== "" &&
    formData.confirmPassword !== "" &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name.trim() },
        },
      });

      if (signError) {
        setError(signError.message || "Failed to create account");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Failed to create account");
        setLoading(false);
        return;
      }

      if (data.session) {
        await apiFetch("/api/auth/ensure-profile", { method: "POST" });
        router.push("/");
        router.refresh();
      } else {
        // Capture email at submit time — frozen, never changes in confirmation box
        setSentEmail(formData.email);
        setEmailSent(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (emailSent) {
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
            <div className="p-4 bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 rounded-md text-sm flex items-start gap-3">
              <span className="text-lg leading-none">✓</span>
              <div>
                <p className="font-medium text-base">Check your email!</p>
                <p className="mt-0.5 text-green-600/80 dark:text-green-400/80">
                  We sent a confirmation link to <strong>{sentEmail}</strong>. Click it to activate your account, then sign in.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-6">
            Join the community and share your music
          </p>

          {error && (
            <div className="mb-4 p-4 bg-yellow-500/15 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 rounded-md flex items-center gap-3">
              <span className="text-base shrink-0">⚠</span>
              <p className="font-medium text-base leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Your name"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>

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
                  placeholder="Min. 6 characters, mix of letters & numbers"
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

            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: formData.password.length > 0 ? "120px" : "0px",
                opacity: formData.password.length > 0 ? 1 : 0,
              }}
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !allFieldsFilled}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/75 enabled:hover:scale-[1.02] enabled:hover:shadow-md"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-lg text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
