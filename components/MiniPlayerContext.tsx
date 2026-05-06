"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface MiniPlayerTrack {
  url: string;
  title: string;
  artist: string;
  imageUrl?: string;
}

interface MiniPlayerContextType {
  track: MiniPlayerTrack | null;
  setTrack: (track: MiniPlayerTrack | null) => void;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export function MiniPlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<MiniPlayerTrack | null>(null);

  return (
    <MiniPlayerContext.Provider value={{ track, setTrack }}>
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  const context = useContext(MiniPlayerContext);
  if (context === undefined) {
    throw new Error("useMiniPlayer must be used within a MiniPlayerProvider");
  }
  return context;
}
