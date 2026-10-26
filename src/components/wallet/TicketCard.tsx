import { formatDay, formatMonth, formatTime } from "@/lib/format";
import type { WalletTicket } from "@/server/queries";
import styles from "./TicketCard.module.css";

/** A ticket styled like a Wallet pass. `qrSvg` is generated on the server from trusted data. */
export function TicketCard({ ticket, qrSvg }: { ticket: WalletTicket; qrSvg: string }) {
  return (
    <article className={styles.ticket}>
      <header className={styles.top}>
        <b>{ticket.title}</b>
        {ticket.when ? (
          <span>
            {formatDay(ticket.when)} {formatMonth(ticket.when)} · {formatTime(ticket.when)}
          </span>
        ) : (
          <span className={styles.badge}>{ticket.subtitle}</span>
        )}
      </header>
      <div className={styles.body}>
        <dl className={styles.kv}>
          <dt>יציע</dt>
          <dd>{ticket.standName}</dd>
          <dt>גוש</dt>
          <dd>{ticket.sectionName}</dd>
          <dt>שורה</dt>
          <dd>{ticket.row}</dd>
          <dt>כיסא</dt>
          <dd>{ticket.seat}</dd>
          <dt>שער</dt>
          <dd>{ticket.gate}</dd>
        </dl>
        <div className={styles.qr} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        <div className={styles.code}>{ticket.code} · דמה</div>
      </div>
    </article>
  );
}
