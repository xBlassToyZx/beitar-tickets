import type { Metadata } from "next";
import Link from "next/link";
import { BuySeasonButton } from "@/components/season/BuySeasonButton";
import { formatILS } from "@/domain/money";
import { currentSeason } from "@/domain/rules";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { getSeasonTicket, listSeasonPlans } from "@/server/season";
import styles from "./season.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "מנויים" };

export default async function SeasonPage() {
  const [plans, owned] = await Promise.all([
    listSeasonPlans(db),
    getSeasonTicket(db, await getBuyerId()),
  ]);
  const season = currentSeason();

  return (
    <div className="container page">
      <div className="eyebrow">מנוי עונתי {season}</div>
      <h1>מנוי לכל משחקי הבית</h1>
      <p className="lead">
        15 משחקי ליגה בטדי, מושב קבוע לכל העונה וכרטיס מנוי דיגיטלי אחד. מנוי אחד לכל אוהד.
      </p>

      {owned && (
        <p className="alert alert-ok" style={{ marginTop: 24 }}>
          יש לך מנוי {owned.plan.name} לעונת {season}. <Link href="/wallet">לכרטיס המנוי</Link>
        </p>
      )}

      <div className={styles.plans}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`card ${styles.plan}`}
            data-featured={plan.featured || undefined}
          >
            {plan.featured && <span className="pill pill-ok">הכי מבוקש</span>}
            <h3>{plan.name}</h3>
            <div className={styles.price}>
              {formatILS(plan.priceAgorot)} <small>לעונה</small>
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="note">{formatILS(Math.round(plan.priceAgorot / 15))} למשחק בממוצע</div>
            <BuySeasonButton
              planId={plan.id}
              planName={plan.name}
              priceLabel={formatILS(plan.priceAgorot)}
              disabled={Boolean(owned)}
              isOwned={owned?.planId === plan.id}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
