"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PeoplePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">People</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to see people and their music
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">People</h1>
        <p className="text-muted-foreground mb-8">
          Discover music lovers and see what they're sharing
        </p>
        
        <div className="text-center py-12 text-muted-foreground">
          Coming soon: Browse users, follow friends, and see their music collections
        </div>
      </div>
    </div>
  );
}

