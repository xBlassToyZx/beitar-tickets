import Link from "next/link";
import { formatCount } from "@/domain/money";
import { formatDay, formatKickoff, formatMonth } from "@/lib/format";
import type { MatchSummary } from "@/server/queries";
import styles from "./MatchCard.module.css";

export function MatchCard({ match }: { match: MatchSummary }) {
  const ratio = match.capacity ? match.available / match.capacity : 0;
  const status =
    match.available === 0
      ? { label: "אזל", className: "pill pill-hot" }
      : ratio < 0.2
        ? { label: "כמעט אזל", className: "pill pill-hot" }
        : { label: `${formatCount(match.available)} מקומות פנויים`, className: "pill" };

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.date} aria-hidden="true">
        <b>{formatDay(match.kickoff)}</b>
        <small>{formatMonth(match.kickoff)}</small>
      </div>
      <div className={styles.body}>
        <div className={styles.comp}>{match.competition}</div>
        <h2 className={styles.teams}>בית&quot;ר ירושלים נגד {match.opponent}</h2>
        <div className={styles.meta}>
          <time dateTime={new Date(match.kickoff).toISOString()}>
            {formatKickoff(match.kickoff)}
          </time>
          <span className={status.className}>{status.label}</span>
        </div>
      </div>
      <div className={styles.action}>
        {match.available > 0 ? (
          <Link href={`/matches/${match.slug}`} className="btn">
            לבחירת מושבים
          </Link>
        ) : (
          <span className="btn" aria-disabled="true" style={{ opacity: 0.35 }}>
            אזל
          </span>
        )}
      </div>
    </article>
  );
}
