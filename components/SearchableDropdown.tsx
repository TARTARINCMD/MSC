"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export default function SearchableDropdown({
  value,
  onChange,
  options,
  allLabel = "All",
  placeholder,
  searchPlaceholder = "Search...",
  className = "",
}: SearchableDropdownProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [search, options]);

  const displayLabel = value === "all" ? (placeholder || allLabel) : value;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`appearance-none rounded-lg border border-border bg-card pl-3 pr-8 py-2 text-sm text-left cursor-pointer hover:bg-muted/50 transition-colors ${
          value === "all" ? "text-muted-foreground" : "text-foreground"
        } ${className}`}
      >
        {displayLabel}
      </button>
      <ChevronDown
        className={`absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-[120] min-w-[200px] max-h-64 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            <button
              type="button"
              onClick={() => { onChange("all"); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                value === "all" ? "font-medium text-primary" : ""
              }`}
            >
              {allLabel}
            </button>
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  value === option ? "font-medium text-primary" : ""
                }`}
              >
                {option}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
