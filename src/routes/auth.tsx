import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or join — WAX" },
      {
        name: "description",
        content: "Log in to WAX or create an account to start sharing the records you listen to.",
      },
      { property: "og:title", content: "Log in or join — WAX" },
      {
        property: "og:description",
        content: "Log in to WAX or create an account to start sharing the records you listen to.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Almost there — check your email to confirm your account.");
        } else {
          toast.success("Welcome in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="py-14 grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-6">
          <p className="label-mono text-primary mb-4">(e) join the room</p>
          <h1 className="font-display text-5xl tracking-tight">Come in, sit down.</h1>
          <p className="mt-5 max-w-[42ch] text-muted text-lg">
            Log in to save records and add your own to the shelf. Your account is what links the
            music you share to your name in the room.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-6 rounded-3xl bg-foreground text-background p-6 ring-1 ring-black/5">
          <div className="flex items-center gap-1 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "label-mono px-3 py-2 rounded-full bg-background text-foreground"
                  : "label-mono px-3 py-2 rounded-full text-background/60 hover:text-background transition-colors"
              }
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={
                mode === "signup"
                  ? "label-mono px-3 py-2 rounded-full bg-background text-foreground"
                  : "label-mono px-3 py-2 rounded-full text-background/60 hover:text-background transition-colors"
              }
            >
              Create account
            </button>
          </div>

          {checkEmail ? (
            <p className="text-sm text-background/80">
              We sent a confirmation link to <span className="font-medium">{email}</span>. Open it,
              then come back and log in.
            </p>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div>
                  <label htmlFor="username" className="block label-mono text-background/60 mb-1.5">
                    Name
                  </label>
                  <input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Mara"
                    className="w-full rounded-xl bg-background/10 border border-background/15 px-3 py-2.5 text-sm placeholder:text-background/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block label-mono text-background/60 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@room.com"
                  className="w-full rounded-xl bg-background/10 border border-background/15 px-3 py-2.5 text-sm placeholder:text-background/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="password" className="block label-mono text-background/60 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-background/10 border border-background/15 px-3 py-2.5 text-sm placeholder:text-background/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:brightness-110 transition disabled:opacity-60"
              >
                {pending ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
