"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/components/SupabaseAuthProvider";

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (user) {
    const label =
      (typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null) || user.email;

    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-background text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-background text-foreground hover:bg-accent transition-colors"
    >
      <User className="h-4 w-4" />
      Login
    </Link>
  );
}
