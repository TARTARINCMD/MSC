"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type SortOrder = "newest" | "oldest";

interface DateSortProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export default function DateSort({ sortOrder, onSortChange }: DateSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: SortOrder[] = ["newest", "oldest"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = sortOrder === "newest" ? "Newest" : "Oldest";
  const isChanged = sortOrder !== "newest"; // Inverted when changed from default (newest)

  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isChanged
            ? "bg-foreground text-background"
            : "bg-background text-foreground"
        }`}
      >
        <span>Date: {selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 min-w-[150px]">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSortChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md capitalize ${
                sortOrder === option
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {option === "newest" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

