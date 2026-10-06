import { getDatabase } from '@/lib/database';
import { withoutEmoji } from '@/lib/text';
type Review = { name: string; message: string; company: string };
async function readReviews(): Promise<Review[]> {
  try {
    const rows = await getDatabase().prepare("SELECT name, payload FROM submissions WHERE kind = 'review' AND status = 'approved' ORDER BY created_at DESC LIMIT 50").all<{name:string;payload:string}>();
    return rows.results.flatMap(row => {
      try {
        const data = JSON.parse(row.payload);
        return data?.publishConsent === true && typeof data.message === 'string'
          ? [{ name: row.name, message: data.message, company: typeof data.company === 'string' ? data.company : '' }] : [];
      } catch { return []; }
    });
  } catch { return []; }
}
export async function ApprovedReviews() {
  const reviews = await readReviews();
  return <>{reviews.map((row, i) => <article className="review-card fx-spot" key={i}><blockquote>“{withoutEmoji(row.message)}”</blockquote><div className="review-person"><strong>{row.name}</strong><span>{row.company}</span></div></article>)}</>;
}
