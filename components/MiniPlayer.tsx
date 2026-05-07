"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play, Pause } from "lucide-react";
import { useMiniPlayer } from "@/components/MiniPlayerContext";
import { getPlatformFromUrl, extractSpotifyId, extractYouTubeId, extractAppleMusicId } from "@/lib/streaming";

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
    SpotifyIframeApi?: SpotifyIFrameAPI;
  }
}
interface SpotifyController {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  loadUri: (uri: string) => void;
}
interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void,
  ) => void;
}

let spotifyApiPromise: Promise<SpotifyIFrameAPI> | null = null;
function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (spotifyApiPromise) return spotifyApiPromise;
  spotifyApiPromise = new Promise((resolve) => {
    if (window.SpotifyIframeApi) { resolve(window.SpotifyIframeApi); return; }
    window.onSpotifyIframeApiReady = (api) => {
      window.SpotifyIframeApi = api;
      resolve(api);
    };
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  });
  return spotifyApiPromise;
}

function SpotifyEmbed({ url }: { url: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyController | null>(null);

  useEffect(() => {
    // Create an unmanaged div for the Spotify API to mutate freely
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mountRef.current = mount;
    wrapperRef.current?.appendChild(mount);

    const id = extractSpotifyId(url);
    if (!id) return;

    const match = url.match(/spotify\.com\/(track|album|playlist|episode)\//);
    const type = match ? match[1] : "track";
    const uri = `spotify:${type}:${id}`;

    let cancelled = false;
    loadSpotifyApi().then((api) => {
      if (cancelled || !mount) return;
      api.createController(
        mount,
        { uri, width: "100%", height: "152" },
        (controller) => {
          controllerRef.current = controller;
          if (!cancelled) controller.play();
        },
      );
    });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      mount.remove();
      mountRef.current = null;
    };
  }, [url]);

  return <div ref={wrapperRef} className="w-full overflow-hidden rounded-xl bg-[#121212]" />;
}

function AppleMusicPreview({ url }: { url: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setPreviewUrl(null);
    setPlaying(false);
    setProgress(0);

    const id = extractAppleMusicId(url);
    if (!id) { setLoading(false); return; }

    fetch(`https://itunes.apple.com/lookup?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const preview = data.results?.[0]?.previewUrl ?? null;
        setPreviewUrl(preview);
      })
      .catch(() => setPreviewUrl(null))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setPlaying(true)).catch(() => {});
    const onEnded = () => setPlaying(false);
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [previewUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading preview…</p>;
  if (!previewUrl) return (
    <p className="text-sm text-muted-foreground">
      No preview available.{" "}
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Open in Apple Music</a>
    </p>
  );

  return (
    <div className="flex items-center gap-3 w-full">
      <audio ref={audioRef} src={previewUrl} preload="metadata" />
      <button
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div
          className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer overflow-hidden hover:h-2 transition-all"
          onClick={seek}
        >
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">30s preview · Apple Music</p>
      </div>
    </div>
  );
}

export default function MiniPlayer() {
  const { track, setTrack } = useMiniPlayer();

  if (!track) return null;

  const platform = getPlatformFromUrl(track.url);
  const isSpotify = platform === "spotify";
  const isYouTube = platform === "youtube" || platform === "youtube_music";
  const isApple = platform === "apple_music";

  const renderPlayer = () => {
    if (isSpotify) {
      return <SpotifyEmbed key={track.url} url={track.url} />;
    }

    if (isYouTube) {
      const id = extractYouTubeId(track.url);
      if (!id) return null;
      return (
        <iframe
          key={track.url}
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-xl"
        />
      );
    }

    if (isApple) {
      return <AppleMusicPreview key={track.url} url={track.url} />;
    }

    return null;
  };

  const width = isYouTube ? "w-[400px]" : "w-[360px]";

  return (
    <div className={`fixed bottom-4 right-4 z-[300] ${width} max-w-[calc(100vw-2rem)] flex flex-col items-end gap-1`}>
      <button
        onClick={() => setTrack(null)}
        aria-label="Close player"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border shadow-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      {renderPlayer()}
    </div>
  );
}
