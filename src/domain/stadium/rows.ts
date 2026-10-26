/**
 * Splits a section's capacity into rows.
 *
 * Real sections are wider than they are deep, so we aim for roughly twice as many seats
 * per row as there are rows. Rows widen slightly toward the back: when the capacity does
 * not divide evenly, the extra seats go to the rows furthest from the pitch.
 *
 * Returns seats-per-row, row 1 first (closest to the pitch). The sum always equals capacity.
 */
export function buildRows(capacity: number): number[] {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new RangeError(`capacity must be a positive integer, got ${capacity}`);
  }
  const rowCount = Math.max(1, Math.round(Math.sqrt(capacity / 2)));
  const base = Math.floor(capacity / rowCount);
  const extra = capacity - base * rowCount;
  return Array.from({ length: rowCount }, (_, i) => base + (i >= rowCount - extra ? 1 : 0));
}

/** Seat numbers after which a walkway is drawn in the seat picker. */
export function aisleBreaks(maxSeatsInRow: number): number {
  return maxSeatsInRow > 30 ? 25 : Math.ceil(maxSeatsInRow / 2);
}
