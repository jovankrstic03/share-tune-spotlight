import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TrackCard, type FeedTrack } from "@/components/track-card";
import { SaveButton } from "@/components/save-button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WAX — the feed" },
      {
        name: "description",
        content: "See the records people are sharing right now, and add your own to the shelf.",
      },
      { property: "og:title", content: "WAX — the feed" },
      {
        property: "og:description",
        content: "See the records people are sharing right now, and add your own to the shelf.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const tracks = useQuery({
    queryKey: ["tracks"],
    queryFn: async (): Promise<FeedTrack[]> => {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, title, artist, user_id, profiles(username)")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as FeedTrack[];
    },
  });

  const people = useQuery({
    queryKey: ["people", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const share = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You need to be logged in to share a record.");
      const { error } = await supabase
        .from("tracks")
        .insert({ user_id: user.id, title: title.trim(), artist: artist.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setArtist("");
      toast.success("Added to the shelf");
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const latest = tracks.data?.[0];

  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="pt-14 pb-10 grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 lg:col-span-7 animate-rise">
          <p className="label-mono text-primary mb-4">(a) the feed</p>
          <h1 className="font-display text-5xl sm:text-[64px] leading-[0.92] tracking-tight">
            Drop the needle
            <br />
            on a friend&apos;s shelf.
          </h1>
          <p className="mt-5 max-w-[42ch] text-muted text-lg">
            A small room where people trade records. See what your friends are spinning, save the
            ones that stick, and find the next person who gets it.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <Link
              to={user ? "/favourites" : "/auth"}
              className="px-5 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:brightness-110 transition"
            >
              {user ? "Your favourites" : "Start sharing"}
            </Link>
            <Link
              to="/people"
              className="px-5 py-3 rounded-full border border-border text-sm font-medium hover:bg-surface transition"
            >
              Browse people
            </Link>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 animate-rise">
          {user ? (
            <form
              className="rounded-3xl bg-surface border border-border p-5 ring-1 ring-black/5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!title.trim() || !artist.trim()) {
                  toast.error("Add both a title and an artist.");
                  return;
                }
                share.mutate();
              }}
            >
              <p className="label-mono text-primary">share a record</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="title" className="block label-mono text-muted mb-1.5">
                    Title
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Midnight Drive"
                    className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label htmlFor="artist" className="block label-mono text-muted mb-1.5">
                    Artist
                  </label>
                  <input
                    id="artist"
                    value={artist}
                    onChange={(event) => setArtist(event.target.value)}
                    placeholder="The Velvet Static"
                    className="w-full rounded-xl bg-background border border-border px-3 py-2.5 text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={share.isPending}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:brightness-110 transition disabled:opacity-60"
                >
                  {share.isPending ? "Adding…" : "Add to the shelf"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-3xl bg-surface border border-border p-4 ring-1 ring-black/5">
              <p className="label-mono text-primary">now sharing</p>
              <p className="font-semibold mt-2 truncate">{latest?.title ?? "Nothing yet"}</p>
              <p className="text-sm text-muted truncate">
                {latest ? `by ${latest.artist}` : "Be the first to share a record."}
              </p>
              <p className="mt-4 text-sm text-muted">
                shared by{" "}
                <span className="text-foreground font-medium">
                  {latest?.profiles?.username ?? "nobody"}
                </span>
              </p>
              <Link
                to="/auth"
                className="mt-4 inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
              >
                Create an account
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-3xl tracking-tight">Fresh on the shelf</h2>
          <span className="label-mono text-muted">(b) track feed</span>
        </div>
        {tracks.isLoading ? (
          <p className="text-sm text-muted">Loading records…</p>
        ) : tracks.data && tracks.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.data.map((track) => (
              <TrackCard key={track.id} track={track} action={<SaveButton trackId={track.id} />} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            No records yet. Log in and add the first one to the shelf.
          </p>
        )}
      </section>

      <section className="py-8 border-t border-border">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-3xl tracking-tight">People in the room</h2>
          <Link to="/people" className="label-mono text-muted hover:text-foreground transition-colors">
            (c) all users
          </Link>
        </div>
        {people.data && people.data.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {people.data.map((person) => (
              <Link
                key={person.id}
                to="/users/$userId"
                params={{ userId: person.id }}
                className="rounded-2xl bg-surface border border-border p-4 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
              >
                <span className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-xl mb-3">
                  {person.username.charAt(0).toUpperCase()}
                </span>
                <p className="font-semibold">{person.username}</p>
                <p className="text-xs text-muted">see their shelf</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Nobody has joined yet.</p>
        )}
      </section>
    </main>
  );
}
