"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { X, ExternalLink, Trash2, Edit, Heart, MessageCircle, Send } from "lucide-react";
import GenreSelect from "@/components/GenreSelect";
import { getPlatformFromUrl, getPlatformLabel } from "@/lib/streaming";
import { getGenreColor } from "@/lib/genres";
import { apiFetch } from "@/lib/api-fetch";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface MusicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onCommentChange?: () => void;
  music: {
    id: string;
    title: string;
    artist: string;
    type: string;
    spotifyUrl: string;
    spotifyId?: string;
    imageUrl?: string;
    description?: string;
    genre?: string;
    dateAdded: string;
    userId: string;
    likeCount?: number;
    liked?: boolean;
    commentCount?: number;
    user?: {
      name: string | null;
      email: string;
    };
  } | null;
  onLikeUpdate?: (findId: string, liked: boolean, likeCount: number) => void;
}

export default function MusicDetailModal({ isOpen, onClose, onUpdate, onCommentChange, music, onLikeUpdate }: MusicDetailModalProps) {
  const { user } = useAuth();
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

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Reset everything when a different music item is opened
  const prevMusicId = useRef<string | null>(null);
  useEffect(() => {
    if (music && music.id !== prevMusicId.current) {
      prevMusicId.current = music.id;
      setDescription(music.description || "");
      setType(music.type);
      setGenre(music.genre || "");
      setLiked(music.liked || false);
      setLikeCount(music.likeCount || 0);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError("");
      setComments([]);
      setNewComment("");
      fetchComments(music.id);
    }
  }, [music]);


  const fetchComments = async (findId: string) => {
    setCommentsLoading(true);
    try {
      const response = await apiFetch(`/api/finds/${findId}/comments`);
      if (response.ok) setComments(await response.json());
    } catch {
      // silently fail
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !music || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await apiFetch(`/api/finds/${music.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.trim() }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        onCommentChange?.();
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!music) return;
    try {
      const response = await apiFetch(`/api/finds/${music.id}/comments/${commentId}`, { method: "DELETE" });
      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCommentChange?.();
      }
    } catch {
      // silently fail
    } finally {
      setCommentToDelete(null);
    }
  };

  if (!isOpen || !music) return null;

  const isOwner = !!user && user.id === music.userId;
  const platform = getPlatformFromUrl(music.spotifyUrl);
  const platformLabel = getPlatformLabel(platform);
  const platformHoverClass =
    platform === "spotify" ? "hover:bg-green-600 hover:border-green-600" :
    platform === "apple_music" ? "hover:bg-pink-600 hover:border-pink-600" :
    platform === "youtube" || platform === "youtube_music" ? "hover:bg-red-600 hover:border-red-600" :
    "hover:bg-primary/90";

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      const response = await apiFetch(`/api/finds/${music.id}/like`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        onLikeUpdate?.(music.id, data.liked, data.likeCount);
      }
    } catch {
      // silently fail
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/finds/${music.id}`, { method: "DELETE" });
      if (response.ok) {
        onUpdate?.();
        onClose();
      } else {
        setError("Failed to delete");
      }
    } catch {
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
      const response = await apiFetch(`/api/finds/${music.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description || null, type, genre: genre || null }),
      });
      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        setError("Failed to update");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">

        {/* ── TOP: blurred bg + cover left / info right ── */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40">
          {music.imageUrl && (
            <div className="absolute inset-0">
              <img src={music.imageUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors backdrop-blur-sm z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Cover stretches full height, info column beside it */}
          <div className="relative flex items-stretch gap-0">
            {/* Cover — full height of the gradient block */}
            <div className="shrink-0 w-28 sm:w-36 md:w-44 overflow-hidden bg-black/30">
              {music.imageUrl ? (
                <img src={music.imageUrl} alt={music.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
              )}
            </div>

            {/* Info — date pushed to bottom */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 p-5 sm:p-6 pr-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2">
                {music.title}
              </h2>
              <p className="text-base text-white/70 font-medium line-clamp-1">{music.artist}</p>

              {/* Tags */}
              {isEditing && isOwner ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-3 py-1 bg-background/80 border border-white/20 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  >
                    <option value="track">Track</option>
                    <option value="album">Album</option>
                    <option value="playlist">Playlist</option>
                    <option value="podcast">Podcast</option>
                  </select>
                  <GenreSelect
                    value={genre}
                    onChange={(value) => setGenre(value)}
                    placeholder="Genre (optional)"
                    inputClassName="px-3 py-1 bg-background/80 border border-white/20 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    dropdownClassName="min-w-[200px]"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="inline-block rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white/90 capitalize">
                    {music.type}
                  </span>
                  {music.genre && (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getGenreColor(music.genre)}`}>
                      {music.genre}
                    </span>
                  )}
                  {music.user?.name && (
                    <span className="inline-block rounded-full bg-primary/30 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white/90">
                      by {music.user.name}
                    </span>
                  )}
                </div>
              )}

              {/* Date pushed to bottom */}
              <p className="mt-auto pt-3 text-xs text-white/40">
                {new Date(music.dateAdded).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── BODY: scrollable ── */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

          {/* Description — only shown if exists or editing */}
          {(music.description || (isEditing && isOwner)) && (
            <div className="px-5 sm:px-6 pt-5">
              {isEditing && isOwner ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Description</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Add a description..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If genre not listed, choose "Other" and note it here.
                  </p>
                </div>
              ) : (
                music.description && (
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{music.description}"
                  </p>
                )
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-5 sm:px-6 pt-4 pb-2">
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
            )}

            {isEditing && isOwner ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDescription(music.description || "");
                    setType(music.type);
                    setGenre(music.genre || "");
                    setError("");
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={music.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap hover:text-white hover:font-bold ${platformHoverClass}`}
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    Open in {platformLabel}
                  </a>

                  {user && (
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        liked
                          ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      <Heart className={`h-4 w-4 transition-all ${liked ? "fill-pink-500" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                      <span>{likeCount}</span>
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        disabled={loading}
                        className="p-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Delete confirmation — inline below buttons, never hidden behind gradient */}
                {showDeleteConfirm && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm mb-3 text-foreground">Delete this music? This cannot be undone.</p>
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
            )}
          </div>

          {/* Comments */}
          <div className="px-5 sm:px-6 pb-5 pt-3 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments ({comments.length})
            </h3>

            <div className="border border-border rounded-lg bg-background/40 overflow-hidden flex flex-col">
              <div className="overflow-y-auto max-h-52 p-3 space-y-2">
                {commentsLoading ? (
                  <p className="text-sm text-muted-foreground py-2">Loading...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No comments yet. Be the first!</p>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 group/comment">
                        <div className="flex-1 bg-secondary/40 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium">
                              {comment.user.name || comment.user.email.split("@")[0]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.body}</p>
                          {/* Inline delete confirmation */}
                          {commentToDelete === comment.id && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                              <span className="text-xs text-muted-foreground flex-1">Delete this comment?</span>
                              <button
                                onClick={() => setCommentToDelete(null)}
                                className="px-2 py-0.5 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="px-2 py-0.5 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        {user && user.id === comment.userId && commentToDelete !== comment.id && (
                          <button
                            onClick={() => setCommentToDelete(comment.id)}
                            className="opacity-0 group-hover/comment:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all self-start mt-0.5"
                            title="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </>
                )}
              </div>

              {user && (
                <form onSubmit={handleSubmitComment} className="flex gap-2 p-2 border-t border-border bg-background/60">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={500}
                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
