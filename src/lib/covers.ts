import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";

const covers = [cover1, cover2, cover3];

/** Deterministic cover art for a track, derived from its id. */
export function coverFor(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return covers[sum % covers.length] ?? cover1;
}
