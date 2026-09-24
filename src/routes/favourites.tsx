import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TrackCard, type FeedTrack } from "@/components/track-card";
import { SaveButton } from "@/components/save-button";

export const Route = createFileRoute("/favourites")({
  head: () => ({
    meta: [
      { title: "Your favourites — WAX" },
      {
        name: "description",
        content: "The records you saved from other people's shelves on WAX.",
      },
      { property: "og:title", content: "Your favourites — WAX" },
      {
        property: "og:description",
        content: "The records you saved from other people's shelves on WAX.",
      },
    ],
  }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const { user, loading } = useAuth();

  const favourites = useQuery({
    queryKey: ["favourites", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<FeedTrack[]> => {
      const { data, error } = await supabase
        .from("favourites")
        .select("track_id, tracks(id, title, artist, user_id, profiles(username))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => row.tracks as unknown as FeedTrack | null)
        .filter((track): track is FeedTrack => Boolean(track));
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="pt-14 pb-8">
        <p className="label-mono text-primary mb-4">(f) saved tracks</p>
        <h1 className="font-display text-5xl tracking-tight">Your favourites</h1>
        <p className="mt-4 text-muted max-w-[46ch]">
          Records you saved while browsing other people&apos;s shelves.
        </p>
      </section>

      <section className="py-8 border-t border-border">
        {loading ? (
          <p className="text-sm text-muted">One moment…</p>
        ) : !user ? (
          <div className="rounded-2xl bg-surface border border-border p-6 ring-1 ring-black/5">
            <p className="text-sm text-muted">Log in to keep a list of your favourite records.</p>
            <Link
              to="/auth"
              className="mt-4 inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
            >
              Log in
            </Link>
          </div>
        ) : favourites.isLoading ? (
          <p className="text-sm text-muted">Loading your records…</p>
        ) : favourites.data && favourites.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favourites.data.map((track) => (
              <TrackCard key={track.id} track={track} action={<SaveButton trackId={track.id} />} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Nothing saved yet. Open someone&apos;s shelf and save a record.
          </p>
        )}
      </section>
    </main>
  );
}
