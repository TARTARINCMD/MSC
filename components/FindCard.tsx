import type { SpotifyFind } from "@/lib/data";
import SpotifyImage from "./SpotifyImage";

interface FindCardProps {
  find: SpotifyFind;
}

export default function FindCard({ find }: FindCardProps) {
  const isNew = (() => {
    const addedDate = new Date(find.dateAdded);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  })();

  return (
    <a
      href={find.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="h-full rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02] group-hover:border-primary/50 relative">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <SpotifyImage
            spotifyUrl={find.spotifyUrl}
            imageUrl={find.imageUrl}
            alt={`${find.title} by ${find.artist}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {isNew && (
              <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-500 capitalize animate-pulse">
                New
              </span>
            )}
            <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize">
              {find.type}
            </span>
            {find.user?.name && (
              <span className="inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary capitalize flex items-center gap-1">
                <span className="opacity-70">by</span> {find.user.name}
              </span>
            )}
          </div>
          <h3 className="mb-1 text-lg font-semibold text-card-foreground line-clamp-1">
            {find.title}
          </h3>
          <p className="mb-1 text-sm font-semibold text-card-foreground line-clamp-1">
            {find.artist}
          </p>
          {find.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">
              {find.description}
            </p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Added on {new Date(find.dateAdded).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </a>
  );
}

