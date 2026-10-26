import { MatchCard } from "@/components/match/MatchCard";
import { MAX_TICKETS_PER_MATCH } from "@/domain/rules";
import { db } from "@/server/db";
import { listUpcomingMatches } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const matches = await listUpcomingMatches(db);
  return (
    <div className="container page">
      <div className="eyebrow">אצטדיון טדי · עונת 2026/27</div>
      <h1>משחקי הבית של בית&quot;ר ירושלים</h1>
      <p className="lead">
        בחר משחק, בחר מושב במפת היציעים, וקבל כרטיס דיגיטלי עם קוד QR לכניסה. עד{" "}
        {MAX_TICKETS_PER_MATCH} כרטיסים למשחק.
      </p>
      {matches.length === 0 ? (
        <div className="card" style={{ padding: 32, marginTop: 32, textAlign: "center" }}>
          <h3>אין כרגע משחקים במכירה</h3>
          <p className="note">משחקים חדשים יופיעו כאן ברגע שהמכירה תיפתח.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gap: 12 }}>
          {matches.map((m) => (
            <li key={m.id}>
              <MatchCard match={m} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
