"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Person {
  id: string;
  name: string | null;
  isFollowing: boolean;
}

interface UserFind {
  id: string;
  title: string;
  artist: string;
  type: string;
  spotifyUrl: string;
  imageUrl: string | null;
  dateAdded: string;
}

export default function PeoplePage() {
  const { data: session } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonFinds, setSelectedPersonFinds] = useState<UserFind[]>([]);
  const [findsLoading, setFindsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/users");
        if (!response.ok) {
          setError("Failed to load people");
          return;
        }
        const data = await response.json();
        setPeople(data);
      } catch {
        setError("Failed to load people");
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [session]);

  const openPersonPosts = async (person: Person) => {
    try {
      setSelectedPerson(person);
      setFindsLoading(true);
      const response = await fetch(`/api/users/${person.id}/finds`);
      if (!response.ok) {
        setError("Failed to load this user's posts");
        setSelectedPersonFinds([]);
        return;
      }
      const data = await response.json();
      setSelectedPersonFinds(data);
    } catch {
      setError("Failed to load this user's posts");
      setSelectedPersonFinds([]);
    } finally {
      setFindsLoading(false);
    }
  };

  const toggleFollow = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!response.ok) {
        setError("Failed to update follow status");
        return;
      }

      const data = await response.json();
      setPeople((prevPeople) =>
        prevPeople.map((person) =>
          person.id === userId
            ? {
                ...person,
                isFollowing: data.isFollowing,
              }
            : person
        )
      );
      setSelectedPerson((prevSelected) =>
        prevSelected && prevSelected.id === userId
          ? { ...prevSelected, isFollowing: data.isFollowing }
          : prevSelected
      );
    } catch {
      setError("Failed to update follow status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">People</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to see people and their music
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">People</h1>
        <p className="text-muted-foreground mb-8">
          Discover music lovers and see what they are sharing
        </p>

        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading people...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && people.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No other users yet.
          </div>
        )}

        {!loading && !error && people.length > 0 && (
          <div className="space-y-3">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => openPersonPosts(person)}
                className="w-full rounded-xl border border-border bg-card px-5 py-4 shadow-sm text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {person.name || "Unnamed User"}
                  </h2>
                  <span className="text-muted-foreground" aria-hidden>
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedPerson && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedPerson(null);
                setSelectedPersonFinds([]);
              }
            }}
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedPerson.name || "Unnamed User"}&apos;s posts
                </h2>
                <button
                  onClick={() => toggleFollow(selectedPerson.id)}
                  disabled={updatingUserId === selectedPerson.id}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60 ${
                    selectedPerson.isFollowing
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {updatingUserId === selectedPerson.id
                    ? "Updating..."
                    : selectedPerson.isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </button>
              </div>

              {findsLoading && (
                <div className="py-8 text-center text-muted-foreground">
                  Loading posts...
                </div>
              )}

              {!findsLoading && selectedPersonFinds.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No music posted yet.
                </div>
              )}

              {!findsLoading && selectedPersonFinds.length > 0 && (
                <div className="space-y-3">
                  {selectedPersonFinds.map((find) => (
                    <a
                      key={find.id}
                      href={find.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{find.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {find.artist}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm capitalize text-muted-foreground">
                            {find.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(find.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

