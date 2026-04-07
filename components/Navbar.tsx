"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Music, Users, Newspaper, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import CircularText from "./CircularText";
import { useAuth } from "@/components/SupabaseAuthProvider";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Music", path: "/", icon: Music },
    { name: "People", path: "/people", icon: Users },
    { name: "News", path: "/news", icon: Newspaper },
  ];

  const displayName =
    user &&
    (typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="scale-[0.45] origin-center">
                <CircularText
                  text="SHARE+TUNE+"
                  onHover="goBonkers"
                  spinDuration={30}
                  className="custom-class"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {displayName || "User"}
                </span>
                <ThemeToggle />
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
