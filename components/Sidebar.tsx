"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Users, Newspaper, LogOut, X } from "lucide-react";
import CircularText from "./CircularText";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const { isOpen, setIsOpen, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Music", path: "/", icon: Music },
    { name: "People", path: "/people", icon: Users },
    { name: "News", path: "/news", icon: Newspaper },
  ];

  if (loading || !user) {
    return null;
  }

  // On mobile (when drawer is open), treat sidebar as expanded
  const expanded = isOpen || isMobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 h-screen bg-card border-r border-border z-50 transition-all duration-300 w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isOpen ? "md:w-72" : "md:w-24",
        ].join(" ")}
        style={{
          boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.3)' : 'none'
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative flex items-center justify-center py-6 overflow-hidden w-full">
            <div className={`transition-all duration-300 ${expanded ? "scale-[0.85]" : "scale-[0.35]"} flex items-center justify-center`}>
              <CircularText
                text="SHARE+TUNE+"
                onHover="goBonkers"
                spinDuration={30}
                className="custom-class"
              />
            </div>
            {/* Mobile close button */}
            <button
              className="md:hidden absolute top-3 right-3 p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6">
            <div className="space-y-1 flex flex-col items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      expanded ? "justify-center" : "justify-center"
                    } ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/40 hover:text-muted-foreground/70"
                    }`}
                    title={!expanded ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground/40"}`} />
                    <span className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Theme, User Info & Logout */}
          {user && (
            <>
              {/* Theme Toggle - Above divider */}
              <div className="flex items-center justify-center py-3">
                <ThemeToggle />
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* User info and Logout - Below divider */}
              <div className="p-3 space-y-2">
                {/* User info */}
                {expanded && (
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium truncate">
                      {(typeof user.user_metadata?.name === "string"
                        ? user.user_metadata.name
                        : null) || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${expanded ? "justify-center" : "justify-center"}`}
                  title={!expanded ? "Logout" : undefined}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                    Logout
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
