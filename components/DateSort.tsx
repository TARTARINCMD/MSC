"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type SortOrder = "newest" | "oldest" | "most_liked";

interface DateSortProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export default function DateSort({ sortOrder, onSortChange }: DateSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "most_liked", label: "Most Liked" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = sortOptions.find((opt) => opt.value === sortOrder);
  const selectedLabel = selectedOption?.label || "Newest";
  const isChanged = sortOrder !== "newest";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isChanged
            ? "bg-foreground text-background"
            : "bg-background text-foreground"
        }`}
      >
        <span>Sort: {selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-[100] min-w-[150px]">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                sortOrder === option.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
