/** Business rules shared by the server and the UI. */

export const MAX_TICKETS_PER_MATCH = 4;

export function seatHoldMinutes(): number {
  const raw = Number(process.env.SEAT_HOLD_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

export function currentSeason(): string {
  return process.env.CURRENT_SEASON || "2026/27";
}

/** Share of a section that must remain for it to show as "available" rather than "few left". */
export const LOW_AVAILABILITY_RATIO = 0.15;
