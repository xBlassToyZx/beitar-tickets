"use client";

import { useEffect, useState } from "react";
import { formatILS } from "@/domain/money";
import { MAX_TICKETS_PER_MATCH } from "@/domain/rules";
import type { CartDTO } from "@/lib/dto";
import styles from "./CartPanel.module.css";

interface Props {
  cart: CartDTO;
  busy: boolean;
  error: string | null;
  onRemove: (seatId: number) => void;
  onCheckout: () => void;
  onExpired: () => void;
}

function useCountdown(expiresAt: string | null, onExpired: () => void) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) {
      setLeft(null);
      return;
    }
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const ms = end - Date.now();
      setLeft(Math.max(0, ms));
      if (ms <= 0) onExpired();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);
  return left;
}

export function CartPanel({ cart, busy, error, onRemove, onCheckout, onExpired }: Props) {
  const [confirming, setConfirming] = useState(false);
  const left = useCountdown(cart.expiresAt, onExpired);
  const minutes = left === null ? null : Math.floor(left / 60_000);
  const seconds = left === null ? null : Math.floor((left % 60_000) / 1000);

  useEffect(() => {
    if (cart.lines.length === 0) setConfirming(false);
  }, [cart.lines.length]);

  return (
    <aside className={`card ${styles.panel}`} aria-label="סל קניות">
      <h3>ההזמנה שלך</h3>

      {cart.lines.length === 0 ? (
        <p className="note">
          בחר גוש במפה ואז לחץ על כיסא פנוי. אפשר לבחור עד {MAX_TICKETS_PER_MATCH} כרטיסים.
        </p>
      ) : (
        <>
          {left !== null && (
            <p className={styles.timer} role="timer" aria-live="off">
              המושבים שמורים לך עוד{" "}
              <b>
                {minutes}:{String(seconds).padStart(2, "0")}
              </b>
            </p>
          )}
          <ul className={styles.lines}>
            {cart.lines.map((line) => (
              <li key={line.seatId}>
                <div>
                  <div className={styles.lineTitle}>{line.sectionName}</div>
                  <div className="note">
                    שורה {line.row} · כיסא {line.number}
                  </div>
                </div>
                <div className={styles.lineEnd}>
                  <span>{formatILS(line.priceAgorot)}</span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => onRemove(line.seatId)}
                    disabled={busy}
                    aria-label={`הסר שורה ${line.row} כיסא ${line.number}`}
                  >
                    הסר
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>סה&quot;כ</span>
            <span>{formatILS(cart.totalAgorot)}</span>
          </div>
        </>
      )}

      {cart.ownedForMatch > 0 && (
        <p className="note">כבר יש לך {cart.ownedForMatch} כרטיסים למשחק הזה.</p>
      )}
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {confirming ? (
        <div className={styles.confirm}>
          <p className="alert alert-ok">
            {cart.lines.length} כרטיסים יונפקו לארנק שלך. זה תשלום דמה, שום כסף לא יחויב.
          </p>
          <div className={styles.confirmActions}>
            <button type="button" className="btn" onClick={onCheckout} disabled={busy}>
              {busy ? "מעבד…" : `שלם ${formatILS(cart.totalAgorot)} (דמה)`}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-block"
          disabled={cart.lines.length === 0 || busy}
          onClick={() => setConfirming(true)}
        >
          המשך לתשלום
        </button>
      )}
    </aside>
  );
}
