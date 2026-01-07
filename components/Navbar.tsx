"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Users, Newspaper, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import CircularText from "./CircularText";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: "Music", path: "/", icon: Music },
    { name: "People", path: "/people", icon: Users },
    { name: "News", path: "/news", icon: Newspaper },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Left - Logo and Nav Items */}
          <div className="flex items-center gap-4">
            {/* Spinning Logo */}
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
            {/* Nav Items */}
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

          {/* Right - User Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {/* User name */}
                <span className="text-sm font-medium">
                  {session.user?.name || "User"}
                </span>
                
                {/* Theme toggle */}
                <ThemeToggle />
                
                {/* Logout button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

