"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Users, Newspaper, LogOut, X } from "lucide-react";
import CircularText from "./CircularText";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import UserProfileModal from "./UserProfileModal";

interface XpData {
  totalXp: number;
  level: number;
  levelName: string;
  progressPercent: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  nextLevelName: string | null;
  currentStreak: number;
}

export default function Sidebar() {
  const { isOpen, setIsOpen, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/users/me/xp")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setXpData(data); })
      .catch(() => {});
  }, [user]);

  const navItems = [
    { name: "Music", path: "/", icon: Music },
    { name: "People", path: "/people", icon: Users },
    { name: "News", path: "/news", icon: Newspaper },
  ];

  if (loading || !user) {
    return null;
  }

  const expanded = isOpen || isMobileOpen;
  const userName =
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) || "User";

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
          boxShadow: isOpen ? "4px 0 24px rgba(0, 0, 0, 0.3)" : "none",
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative flex items-center justify-center py-6 overflow-hidden w-full">
            <div
              className={`transition-all duration-300 ${expanded ? "scale-[0.85]" : "scale-[0.35]"} flex items-center justify-center`}
            >
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
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground/40"}`}
                    />
                    <span
                      className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          {user && (
            <>
              {/* Theme Toggle */}
              <div className="flex items-center justify-center py-3">
                <ThemeToggle />
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Profile Card + Logout */}
              <div className="p-3 space-y-2">
                {/* Profile card — opens My Profile modal */}
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="w-full rounded-lg hover:bg-accent transition-colors text-left"
                >
                  {expanded ? (
                    <div className="px-3 py-2 space-y-1">
                      {/* Row 1: name + level pill */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate text-sm">{userName}</p>
                        {xpData && (
                          <span className="shrink-0 bg-primary/15 text-primary text-xs rounded-full px-2 py-0.5 font-semibold">
                            Lv.{xpData.level}
                          </span>
                        )}
                      </div>
                      {/* Row 2: level name */}
                      {xpData && (
                        <p className="text-xs text-muted-foreground">{xpData.levelName}</p>
                      )}
                      {/* Row 3: XP bar */}
                      {xpData ? (
                        <div className="space-y-0.5">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${xpData.progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {xpData.xpIntoLevel.toLocaleString()} /{" "}
                            {xpData.xpNeededForNext > 0
                              ? xpData.xpNeededForNext.toLocaleString()
                              : "MAX"}{" "}
                            XP
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                  ) : (
                    /* Collapsed: avatar initial always */
                    <div className="flex items-center justify-center py-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {userName[0].toUpperCase()}
                      </div>
                    </div>
                  )}
                </button>

                {/* Logout — only visible when expanded */}
                {expanded && (
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* My Profile Modal */}
      {profileModalOpen && (
        <UserProfileModal
          userId={user.id}
          userName={userName}
          isOwnProfile={true}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </>
  );
}
