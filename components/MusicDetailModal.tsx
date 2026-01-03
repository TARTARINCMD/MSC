"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, ExternalLink, Trash2, Edit, Heart } from "lucide-react";

interface MusicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  music: {
    id: string;
    title: string;
    artist: string;
    type: string;
    spotifyUrl: string;
    spotifyId: string;
    imageUrl?: string;
    description?: string;
    genre?: string;
    dateAdded: string;
    userId: string;
    likeCount?: number;
    liked?: boolean;
    user?: {
      name: string | null;
      email: string;
    };
  } | null;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
}

export default function MusicDetailModal({ isOpen, onClose, onUpdate, music, onLikeUpdate }: MusicDetailModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (music) {
      setDescription(music.description || "");
      setType(music.type);
      setGenre(music.genre || "");
      setLiked(music.liked || false);
      setLikeCount(music.likeCount || 0);
    }
  }, [music]);

  if (!isOpen || !music) return null;

  const isOwner = session?.user && (session.user as any).id === music.userId;

  const handleLike = async () => {
    if (!session || isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/finds/${music.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        onLikeUpdate?.(music.id, data.liked, data.likeCount);
      }
    } catch (error) {
      console.error("Error liking:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finds/${music.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
        onClose();
      } else {
        setError("Failed to delete");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/finds/${music.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description || null,
          type,
          genre: genre || null,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
        // Don't close modal, just update and stay open
      } else {
        setError("Failed to update");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header with image */}
        <div className="relative h-80 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 overflow-hidden">
          {/* Blurred background */}
          {music.imageUrl && (
            <div className="absolute inset-0">
              <img
                src={music.imageUrl}
                alt=""
                className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
              />
            </div>
          )}
          
          {/* Main image - centered and contained */}
          <div className="relative h-full flex items-center justify-center p-6">
            {music.imageUrl ? (
              <img
                src={music.imageUrl}
                alt={music.title}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
              />
            ) : (
              <div className="text-muted-foreground text-center">
                <div className="text-4xl mb-2">🎵</div>
                <p>No cover image</p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors backdrop-blur-sm z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Artist */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-2">{music.title}</h2>
            <p className="text-xl text-muted-foreground">{music.artist}</p>
          </div>

          {/* Metadata - Editable if owner and in edit mode */}
          <div className="mb-4">
            {isEditing && isOwner ? (
              <div className="flex flex-wrap gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="track">Track</option>
                  <option value="album">Album</option>
                  <option value="playlist">Playlist</option>
                  <option value="podcast">Podcast</option>
                </select>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Genre (optional)"
                  className="px-3 py-1 bg-background border border-border rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground capitalize">
                  {music.type}
                </span>
                {music.genre && (
                  <span className="inline-block rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                    {music.genre}
                  </span>
                )}
                {music.user?.name && (
                  <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                    by {music.user.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Description</h3>
            {isEditing && isOwner ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add a description..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            ) : (
              <p className="text-foreground italic">
                {music.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Date and Likes */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Added {new Date(music.dateAdded).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            
            {/* Like button */}
            {session && (
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30"
                    : "bg-secondary hover:bg-accent"
                } ${!session ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${liked ? "fill-pink-500" : ""} ${isLiking ? "animate-pulse" : ""}`}
                />
                <span className="font-medium">{likeCount}</span>
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={music.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Spotify
            </a>

            {isOwner && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setDescription(music.description || "");
                        setType(music.type);
                        setGenre(music.genre || "");
                      }}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        disabled={loading}
                        className="p-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      
                      {/* Delete Confirmation Popup */}
                      {showDeleteConfirm && (
                        <div className="absolute bottom-full right-0 mb-2 p-3 bg-card border border-border rounded-lg shadow-xl z-10 w-64">
                          <p className="text-sm mb-3">Delete this music? This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDelete}
                              disabled={loading}
                              className="flex-1 px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                            >
                              {loading ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
