import { notFound } from "next/navigation";
import Link from "next/link";
import { getFindById } from "@/lib/data";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import SpotifyImage from "@/components/SpotifyImage";
import { getPlatformFromUrl, getPlatformLabel } from "@/lib/streaming";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";

interface FindPageProps {
  params: {
    id: string;
  };
}

export default function FindPage({ params }: FindPageProps) {
  const find = getFindById(params.id);

  if (!find) {
    notFound();
  }
  const platform = getPlatformFromUrl(find.spotifyUrl);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all finds
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-lg border border-border bg-card">
            <div className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative h-64 w-64 flex-shrink-0 overflow-hidden rounded-lg sm:h-80 sm:w-80">
                  <SpotifyImage
                    spotifyUrl={find.spotifyUrl}
                    imageUrl={find.imageUrl}
                    alt={`${find.title} by ${find.artist}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground capitalize">
                      {find.type}
                    </span>
                  </div>
                  <h1 className="mb-2 text-4xl font-bold text-foreground">{find.title}</h1>
                  <p className="mb-4 text-xl text-muted-foreground">
                    {find.artist}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Added on {new Date(find.dateAdded).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {find.description && (
                    <p className="mt-4 text-base leading-relaxed text-foreground">
                      {find.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {platform === "spotify" && find.spotifyId && (
            <div className="mb-8 rounded-lg border border-border bg-card">
              <div className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  Listen on {getPlatformLabel(platform)}
                </h2>
                <SpotifyPlayer spotifyId={find.spotifyId} type={find.type} />
              </div>
            </div>
          )}

          <div className="text-center">
            <a
              href={find.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open in {getPlatformLabel(platform)}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

