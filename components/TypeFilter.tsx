"use client";

import { useState, useRef, useEffect } from "react";
import type { FindType } from "@/lib/data";
import { ChevronDown } from "lucide-react";

interface TypeFilterProps {
  selectedType: FindType | "all";
  onTypeChange: (type: FindType | "all") => void;
}

export default function TypeFilter({ selectedType, onTypeChange }: TypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const types: (FindType | "all")[] = ["all", "track", "album", "playlist"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = selectedType === "all" ? "All" : selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
  const isSelected = selectedType !== "all";

  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isSelected
            ? "bg-foreground text-background"
            : "bg-background text-foreground"
        }`}
      >
        <span>Type: {selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 min-w-[150px]">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => {
                onTypeChange(type);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md capitalize ${
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

