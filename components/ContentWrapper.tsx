"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";
import { useSidebar } from "./SidebarContext";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  return (
    <div className={!loading && user ? "pl-24" : ""}>
      {children}
    </div>
  );
}
