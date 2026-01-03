"use client";

import { Grid3x3, LayoutGrid } from "lucide-react";

type LayoutType = "grid" | "compact";

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export default function LayoutSelector({ currentLayout, onLayoutChange }: LayoutSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
      <button
        onClick={() => onLayoutChange("grid")}
        className={`p-2 rounded-md transition-all ${
          currentLayout === "grid"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayoutChange("compact")}
        className={`p-2 rounded-md transition-all ${
          currentLayout === "compact"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Compact View"
      >
        <Grid3x3 className="h-4 w-4" />
      </button>
    </div>
  );
}

