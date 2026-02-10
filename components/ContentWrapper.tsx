"use client";

import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  return (
    <div className={session ? "pl-24" : ""}>
      {children}
    </div>
  );
}

