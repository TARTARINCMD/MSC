"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
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

