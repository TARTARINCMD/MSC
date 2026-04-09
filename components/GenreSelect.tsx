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
  const inputRef = useRef<HTMLInputElement>(null);

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
    return GENRES.filter((genre) => genre.toLowerCase().includes(query));
  }, [search]);

  const displayValue = isOpen ? search : value;

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        placeholder={value ? value : placeholder}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className={`w-full pr-9 ${inputClassName}`}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) inputRef.current?.focus();
        }}
        className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground"
        aria-label="Toggle genre options"
        tabIndex={-1}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-md shadow-lg z-[120] max-h-56 overflow-y-auto ${dropdownClassName}`}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          >
            None
          </button>
          {filtered.map((genre) => (
            <button
              key={genre}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(genre);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {genre}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-sm text-muted-foreground">No genres found</p>
          )}
        </div>
      )}
    </div>
  );
}
