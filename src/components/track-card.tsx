import { Link } from "@tanstack/react-router";
import { coverFor } from "@/lib/covers";

export type FeedTrack = {
  id: string;
  title: string;
  artist: string;
  user_id: string;
  profiles?: { username: string } | null;
};

export function TrackCard({ track, action }: { track: FeedTrack; action?: React.ReactNode }) {
  return (
    <article className="rounded-2xl bg-surface border border-border p-4 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <img
        src={coverFor(track.id)}
        alt=""
        loading="lazy"
        width={816}
        height={816}
        className="w-full aspect-square rounded-xl object-cover mb-3"
      />
      <p className="font-semibold leading-tight">{track.title}</p>
      <p className="text-sm text-muted">{track.artist}</p>
      <div className="mt-3 flex items-center gap-2">
        {track.profiles ? (
          <Link
            to="/users/$userId"
            params={{ userId: track.user_id }}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            shared by <span className="text-foreground font-medium">{track.profiles.username}</span>
          </Link>
        ) : (
          <span className="text-xs text-muted">shared record</span>
        )}
        {action ? <span className="ml-auto">{action}</span> : null}
      </div>
    </article>
  );
}
