"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GENRES } from "@/lib/genres";

interface GenreFilterProps {
  selectedGenre: string | "all";
  onGenreChange: (genre: string | "all") => void;
}

export default function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allGenres: (string | "all")[] = useMemo(() => ["all", ...GENRES], []);

  const filteredGenres = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allGenres;
    return allGenres.filter(
      (genre) => genre === "all" || genre.toLowerCase().startsWith(query)
    );
  }, [allGenres, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const selectedLabel = selectedGenre === "all" ? "All" : selectedGenre;
  const isSelected = selectedGenre !== "all";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isSelected
            ? "bg-foreground text-background"
            : "bg-background text-foreground"
        }`}
      >
        <span>Genre: {selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-[100] min-w-[200px] max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search genre..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {filteredGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                onGenreChange(genre);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selectedGenre === genre
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {genre === "all" ? "All" : genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
