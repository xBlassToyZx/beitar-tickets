import { aisleBreaks } from "@/domain/stadium/rows";
import type { SeatMapDTO } from "@/lib/dto";
import styles from "./SeatGrid.module.css";

interface Props {
  seatMap: SeatMapDTO;
  pendingSeatId: number | null;
  onToggle: (seatId: number, isMine: boolean) => void;
}

export function SeatGrid({ seatMap, pendingSeatId, onToggle }: Props) {
  const longest = Math.max(...seatMap.rows.map((r) => r.seats.length));
  const dense = longest > 30;
  const step = aisleBreaks(longest);

  return (
    <div className={styles.scroll}>
      <div className={styles.pitch}>המגרש</div>
      <div
        className={`${styles.grid} ${dense ? styles.dense : ""}`}
        role="grid"
        aria-label="מושבים בגוש"
      >
        {seatMap.rows.map(({ row, seats }) => (
          <div key={row} className={styles.row} role="row">
            <span className={styles.rowLabel} aria-hidden="true">
              {row}
            </span>
            {seats.map((seat) => {
              const label = `שורה ${row}, כיסא ${seat.number}`;
              return (
                <span key={seat.id} className={styles.cell} role="gridcell">
                  {seat.number > 1 && (seat.number - 1) % step === 0 && (
                    <span className={styles.aisle} aria-hidden="true" />
                  )}
                  <button
                    type="button"
                    className={styles.seat}
                    data-status={seat.status}
                    data-pending={pendingSeatId === seat.id || undefined}
                    disabled={seat.status === "taken"}
                    aria-pressed={seat.status === "mine"}
                    aria-label={seat.status === "taken" ? `${label}, תפוס` : label}
                    title={label}
                    onClick={() => onToggle(seat.id, seat.status === "mine")}
                  >
                    {dense ? "" : seat.number}
                  </button>
                </span>
              );
            })}
            <span className={styles.rowLabel} aria-hidden="true">
              {row}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span>
          <i data-status="free" />
          פנוי
        </span>
        <span>
          <i data-status="mine" />
          נבחר
        </span>
        <span>
          <i data-status="taken" />
          תפוס
        </span>
      </div>
    </div>
  );
}
