import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function SaveButton({ trackId }: { trackId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favourites = useQuery({
    queryKey: ["favourite-ids", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("favourites").select("track_id");
      if (error) throw error;
      return (data ?? []).map((row) => row.track_id);
    },
  });

  const saved = favourites.data?.includes(trackId) ?? false;

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Log in to save records.");
      if (saved) {
        const { error } = await supabase
          .from("favourites")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", trackId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favourites")
          .insert({ user_id: user.id, track_id: trackId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourite-ids"] });
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      className={
        saved
          ? "label-mono rounded-full bg-primary text-primary-foreground px-3 py-1.5 transition hover:brightness-110"
          : "label-mono rounded-full border border-border px-3 py-1.5 text-muted transition hover:text-foreground"
      }
    >
      {saved ? "saved" : "save"}
    </button>
  );
}
