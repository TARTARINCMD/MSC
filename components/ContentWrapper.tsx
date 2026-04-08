"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className={user ? "pl-24" : ""}>
      {children}
    </div>
  );
}
