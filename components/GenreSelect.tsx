"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GENRES } from "@/lib/genres";

interface GenreSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  dropdownClassName?: string;
}

export default function GenreSelect({
  value,
  onChange,
  placeholder = "Select a genre",
  inputClassName = "",
  dropdownClassName = "",
}: GenreSelectProps) {
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
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return GENRES;
    return GENRES.filter((genre) => genre.toLowerCase().startsWith(query));
  }, [search]);

  const selectedLabel = value || "";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full pr-9 text-left ${inputClassName}`}
      >
        {selectedLabel ? (
          selectedLabel
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground"
        aria-label="Toggle genre options"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-[120] min-w-[200px] max-h-60 overflow-y-auto ${dropdownClassName}`}
        >
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search genre..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            None
          </button>
          {filtered.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                onChange(genre);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
