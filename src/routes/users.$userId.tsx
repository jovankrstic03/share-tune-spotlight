import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { coverFor } from "@/lib/covers";
import { SaveButton } from "@/components/save-button";

export const Route = createFileRoute("/users/$userId")({
  head: () => ({
    meta: [
      { title: "A listener's shelf — WAX" },
      {
        name: "description",
        content: "See every record this person shares and listens to on WAX.",
      },
      { property: "og:title", content: "A listener's shelf — WAX" },
      {
        property: "og:description",
        content: "See every record this person shares and listens to on WAX.",
      },
    ],
  }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, created_at")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const tracks = useQuery({
    queryKey: ["tracks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, title, artist, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="pt-14 pb-8">
        <Link to="/people" className="label-mono text-muted hover:text-foreground transition-colors">
          ← all people
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="size-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-2xl shrink-0">
            {(profile.data?.username ?? "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="label-mono text-primary">(d) listening list</p>
            <h1 className="font-display text-4xl tracking-tight">
              {profile.isLoading
                ? "Loading…"
                : profile.data
                  ? `${profile.data.username}'s shelf`
                  : "Listener not found"}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="rounded-3xl bg-surface border border-border p-6 ring-1 ring-black/5">
          {tracks.isLoading ? (
            <p className="text-sm text-muted">Loading records…</p>
          ) : tracks.data && tracks.data.length > 0 ? (
            <div className="divide-y divide-border">
              {tracks.data.map((track, index) => (
                <div key={track.id} className="py-3 flex items-center gap-3">
                  <span className="label-mono text-muted w-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={coverFor(track.id)}
                    alt=""
                    loading="lazy"
                    width={816}
                    height={816}
                    className="size-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted truncate">{track.artist}</p>
                  </div>
                  <SaveButton trackId={track.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">This shelf is still empty.</p>
          )}
        </div>
      </section>
    </main>
  );
}
