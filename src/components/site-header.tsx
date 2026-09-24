import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const navLinkClass = "px-3 py-2 rounded-full label-mono text-muted hover:text-foreground transition-colors";
const navActiveClass = "px-3 py-2 rounded-full label-mono bg-foreground text-background";

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-primary grid place-items-center text-primary-foreground font-display text-lg leading-none">
            W
          </span>
          <span className="font-display text-2xl tracking-tight leading-none">WAX</span>
          <span className="hidden sm:inline label-mono text-muted mt-1">sharing records</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/" activeOptions={{ exact: true }} className={navLinkClass} activeProps={{ className: navActiveClass }}>
            Feed
          </Link>
          <Link to="/people" className={navLinkClass} activeProps={{ className: navActiveClass }}>
            People
          </Link>
          <Link to="/favourites" className={navLinkClass} activeProps={{ className: navActiveClass }}>
            Favourites
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
