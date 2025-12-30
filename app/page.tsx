"use client";

import { useState } from "react";
import { spotifyFinds, type FindType } from "@/lib/data";
import FindList from "@/components/FindList";
import { ThemeToggle } from "@/components/theme-toggle";
import CircularText from "@/components/CircularText";
import TypeFilter from "@/components/TypeFilter";
import GenreFilter from "@/components/GenreFilter";
import DateSort from "@/components/DateSort";

type SortOrder = "newest" | "oldest";

export default function Home() {
  const [selectedType, setSelectedType] = useState<FindType | "all">("all");
  const [selectedGenre, setSelectedGenre] = useState<string | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filteredFinds = spotifyFinds.filter((find) => {
    const typeMatch = selectedType === "all" || find.type === selectedType;
    const genreMatch = selectedGenre === "all" || find.genre === selectedGenre;
    return typeMatch && genreMatch;
  });

  const sortedFinds = [...filteredFinds].sort((a, b) => {
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Left sidebar for logo - hidden on mobile, visible on larger screens */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex md:items-start md:justify-center md:pt-6 z-40">
        <div>
          <CircularText
            text="SHARE+TUNE+"
            onHover="goBonkers"
            spinDuration={30}
            className="custom-class"
          />
        </div>
      </aside>

      {/* Mobile logo - shown only on small screens */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <div className="scale-50 origin-top-left">
          <CircularText
            text="SHARE+TUNE+"
            onHover="goBonkers"
            spinDuration={30}
            className="custom-class"
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="md:ml-64">
        <div className="fixed bottom-0 left-0 z-50 p-4 md:p-6">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-4 py-8 pt-24 md:pt-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <TypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />
            <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
            <DateSort sortOrder={sortOrder} onSortChange={setSortOrder} />
          </div>
          <FindList finds={sortedFinds} />
        </main>
      </div>
    </div>
  );
}
