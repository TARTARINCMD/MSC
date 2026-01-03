"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { spotifyFinds } from "@/lib/data";

interface GenreFilterProps {
  selectedGenre: string | "all";
  onGenreChange: (genre: string | "all") => void;
}

export default function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all unique genres from the data
  const genres = Array.from(
    new Set(spotifyFinds.map((find) => find.genre).filter((genre): genre is string => !!genre))
  ).sort();
  const allGenres: (string | "all")[] = ["all", ...genres];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-[100] min-w-[150px] max-h-60 overflow-y-auto">
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                onGenreChange(genre);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
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

