import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeatPicker } from "@/components/seat-picker/SeatPicker";
import { MAX_TICKETS_PER_MATCH } from "@/domain/rules";
import { formatKickoff } from "@/lib/format";
import { getMatchAvailability } from "@/server/availability";
import { getCart } from "@/server/booking";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { getMatchBySlug } from "@/server/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = await getMatchBySlug(db, (await params).slug);
  return { title: match ? `נגד ${match.opponent}` : "משחק לא נמצא" };
}

export default async function MatchPage({ params }: Props) {
  const match = await getMatchBySlug(db, (await params).slug);
  if (!match) notFound();

  const [availability, cart] = await Promise.all([
    getMatchAvailability(db, match.id),
    getCart(db, { buyerId: await getBuyerId(), matchId: match.id }),
  ]);

  return (
    <div className="container page">
      <Link href="/" className="note" style={{ color: "var(--accent)" }}>
        → חזרה למשחקים
      </Link>
      <div style={{ marginTop: 10 }}>
        <div className="eyebrow">{match.competition}</div>
        <h1>בית&quot;ר ירושלים נגד {match.opponent}</h1>
        <p className="lead">
          {formatKickoff(match.kickoff)} · אצטדיון טדי, ירושלים · עד {MAX_TICKETS_PER_MATCH} כרטיסים
        </p>
      </div>
      <SeatPicker
        matchId={match.id}
        initialAvailability={availability}
        initialCart={JSON.parse(JSON.stringify(cart))}
      />
    </div>
  );
}
