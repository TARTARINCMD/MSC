"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";
import { useSidebar } from "@/components/SidebarContext";
import { Menu } from "lucide-react";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setIsMobileOpen } = useSidebar();

  return (
    <div className={user ? "pl-0 md:pl-24" : ""}>
      {/* Mobile-only sticky top bar */}
      {user && (
        <div className="md:hidden sticky top-0 z-40 flex items-center h-12 px-4 bg-background/80 backdrop-blur-md border-b border-border">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-lg font-bold tracking-wide">Sharetune</span>
        </div>
      )}
      {children}
    </div>
  );
}
