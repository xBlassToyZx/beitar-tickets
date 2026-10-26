"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatCount, formatILS } from "@/domain/money";
import { getSection } from "@/domain/stadium/sections";
import { api, ApiError } from "@/lib/api-client";
import type { AvailabilityDTO, CartDTO, SeatMapDTO } from "@/lib/dto";
import { CartPanel } from "./CartPanel";
import { SeatGrid } from "./SeatGrid";
import { StadiumMap } from "./StadiumMap";
import styles from "./SeatPicker.module.css";

interface Props {
  matchId: string;
  initialAvailability: AvailabilityDTO;
  initialCart: CartDTO;
}

const REFRESH_MS = 30_000;

export function SeatPicker({ matchId, initialAvailability, initialCart }: Props) {
  const router = useRouter();
  const [availability, setAvailability] = useState(initialAvailability);
  const [cart, setCart] = useState(initialCart);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [seatMap, setSeatMap] = useState<SeatMapDTO | null>(null);
  const [pendingSeatId, setPendingSeatId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSeats = useCallback(
    async (id: string) => {
      setSeatMap(
        await api<SeatMapDTO>(`/api/matches/${matchId}/sections/${encodeURIComponent(id)}/seats`),
      );
    },
    [matchId],
  );

  const refresh = useCallback(async () => {
    const [nextAvailability, nextCart] = await Promise.all([
      api<AvailabilityDTO>(`/api/matches/${matchId}/availability`),
      api<CartDTO>(`/api/cart?matchId=${matchId}`),
    ]);
    setAvailability(nextAvailability);
    setCart(nextCart);
  }, [matchId]);

  // Keep the map current while the page is open.
  useEffect(() => {
    const id = setInterval(() => {
      refresh().catch(() => undefined);
      if (sectionId) loadSeats(sectionId).catch(() => undefined);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh, loadSeats, sectionId]);

  async function openSection(id: string) {
    setError(null);
    setSectionId(id);
    setSeatMap(null);
    try {
      await loadSeats(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "טעינת המושבים נכשלה.");
    }
  }

  function backToMap() {
    setSectionId(null);
    setSeatMap(null);
    setError(null);
  }

  async function toggleSeat(seatId: number, isMine: boolean) {
    setError(null);
    setPendingSeatId(seatId);
    try {
      await api("/api/holds", { method: isMine ? "DELETE" : "POST", body: { matchId, seatId } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "הפעולה נכשלה. נסה שוב.");
    } finally {
      await Promise.all([refresh(), sectionId ? loadSeats(sectionId) : null]).catch(
        () => undefined,
      );
      setPendingSeatId(null);
    }
  }

  async function removeLine(seatId: number) {
    await toggleSeat(seatId, true);
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/checkout", { method: "POST", body: { matchId } });
      router.push("/wallet?purchased=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "התשלום נכשל. נסה שוב.");
      await refresh().catch(() => undefined);
      if (sectionId) await loadSeats(sectionId).catch(() => undefined);
      setBusy(false);
    }
  }

  const onExpired = useCallback(() => {
    refresh().catch(() => undefined);
    if (sectionId) loadSeats(sectionId).catch(() => undefined);
  }, [refresh, loadSeats, sectionId]);

  const section = sectionId ? getSection(sectionId) : undefined;

  return (
    <div className={styles.layout}>
      <section className={`card ${styles.panel}`}>
        {!section ? (
          <>
            <h3>בחר גוש ביציע</h3>
            <div className={styles.mapWrap}>
              <StadiumMap availability={availability} onSelect={openSection} />
            </div>
            <div className={styles.legend}>
              <span>
                <i style={{ background: "var(--sec)" }} />
                פנוי
              </span>
              <span>
                <i style={{ background: "var(--sec-low)" }} />
                מעט מקומות
              </span>
              <span>
                <i style={{ background: "var(--away)" }} />
                קבוצה אורחת (סגור)
              </span>
              <span>
                <i style={{ background: "var(--gold)" }} />
                גוש נבחר
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.sectionHead}>
              <div>
                <div className="eyebrow">{seatMap?.section.standName ?? ""}</div>
                <h3>{section.name}</h3>
                {seatMap && (
                  <p className="note" style={{ margin: "4px 0 0" }}>
                    {formatILS(seatMap.section.priceAgorot)} לכרטיס ·{" "}
                    {formatCount(seatMap.available)} פנויים מתוך{" "}
                    {formatCount(seatMap.section.capacity)} · {seatMap.rows.length} שורות · שער{" "}
                    {seatMap.section.gate}
                  </p>
                )}
              </div>
              <button type="button" className={styles.mini} onClick={backToMap}>
                <StadiumMap availability={availability} selectedId={sectionId} mini />
                <span>חזרה למפה</span>
              </button>
            </div>
            {error && !seatMap && <p className="alert alert-error">{error}</p>}
            {seatMap ? (
              <SeatGrid seatMap={seatMap} pendingSeatId={pendingSeatId} onToggle={toggleSeat} />
            ) : (
              !error && <p className="note">טוען מושבים…</p>
            )}
          </>
        )}
      </section>

      <CartPanel
        cart={cart}
        busy={busy}
        error={error}
        onRemove={removeLine}
        onCheckout={pay}
        onExpired={onExpired}
      />
    </div>
  );
}
