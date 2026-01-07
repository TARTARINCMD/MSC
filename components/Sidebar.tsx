"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Users, Newspaper, LogOut } from "lucide-react";
import CircularText from "./CircularText";
import { ThemeToggle } from "./theme-toggle";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: "Music", path: "/", icon: Music },
    { name: "People", path: "/people", icon: Users },
    { name: "News", path: "/news", icon: Newspaper },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border z-40 transition-all duration-300 ${
          isOpen ? "w-72" : "w-24"
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center py-6 overflow-hidden w-full">
            <div className={`transition-all duration-300 ${isOpen ? "scale-[0.85]" : "scale-[0.35]"} flex items-center justify-center`}>
              <CircularText
                text="SHARE+TUNE+"
                onHover="goBonkers"
                spinDuration={30}
                className="custom-class"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6">
            <div className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/40 hover:text-muted-foreground/70"
                    }`}
                    title={!isOpen ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground/40"}`} />
                    <span className={`transition-opacity duration-300 text-center ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Theme & Logout */}
          {session && (
            <div className="border-t border-border p-3 space-y-2">
              {/* User info */}
              {isOpen && (
                <div className="px-3 py-2 text-sm">
                  <p className="font-medium truncate">{session.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                </div>
              )}

              {/* Theme Toggle */}
              <div className={`flex items-center gap-3 px-3 py-2 ${isOpen ? "justify-start" : "justify-center"}`}>
                <div className="flex items-center justify-center">
                  <ThemeToggle />
                </div>
                {isOpen && <span className="text-sm">Theme</span>}
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
                  isOpen ? "justify-start" : "justify-center"
                }`}
                title={!isOpen ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

