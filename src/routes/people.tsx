import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People in the room — WAX" },
      {
        name: "description",
        content: "Everyone sharing records on WAX. Click a person to see what they listen to.",
      },
      { property: "og:title", content: "People in the room — WAX" },
      {
        property: "og:description",
        content: "Everyone sharing records on WAX. Click a person to see what they listen to.",
      },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const people = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, tracks(count)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="pt-14 pb-8">
        <p className="label-mono text-primary mb-4">(c) users</p>
        <h1 className="font-display text-5xl tracking-tight">People in the room</h1>
        <p className="mt-4 text-muted max-w-[46ch]">
          Every listener who has joined. Click someone to see the records on their shelf.
        </p>
      </section>

      <section className="py-8 border-t border-border">
        {people.isLoading ? (
          <p className="text-sm text-muted">Loading listeners…</p>
        ) : people.data && people.data.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {people.data.map((person) => {
              const count = (person.tracks as { count: number }[] | null)?.[0]?.count ?? 0;
              return (
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
                  <p className="text-xs text-muted">
                    {count} {count === 1 ? "record" : "records"} shared
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">Nobody has joined yet.</p>
        )}
      </section>
    </main>
  );
}
