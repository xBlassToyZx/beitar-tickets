import { currentSeason } from "@/domain/rules";
import type { Db } from "./prisma";

export interface SectionAvailability {
  capacity: number;
  available: number;
  onSale: boolean;
}

/** Remaining seats per section for one match: capacity minus sold, held and season seats. */
export async function getMatchAvailability(
  db: Db,
  matchId: string,
  now: Date = new Date(),
): Promise<Record<string, SectionAvailability>> {
  const [sections, sold, held, season] = await Promise.all([
    db.section.findMany({ select: { id: true, capacity: true, onSale: true } }),
    db.ticket.groupBy({ by: ["sectionId"], where: { matchId }, _count: { _all: true } }),
    db.seatHold.groupBy({
      by: ["sectionId"],
      where: { matchId, expiresAt: { gt: now } },
      _count: { _all: true },
    }),
    db.seasonTicket.groupBy({
      by: ["sectionId"],
      where: { season: currentSeason() },
      _count: { _all: true },
    }),
  ]);

  const count = (rows: { sectionId: string; _count: { _all: number } }[]) =>
    new Map(rows.map((r) => [r.sectionId, r._count._all]));
  const soldBy = count(sold);
  const heldBy = count(held);
  const seasonBy = count(season);

  const result: Record<string, SectionAvailability> = {};
  for (const s of sections) {
    const taken = (soldBy.get(s.id) ?? 0) + (heldBy.get(s.id) ?? 0) + (seasonBy.get(s.id) ?? 0);
    result[s.id] = {
      capacity: s.capacity,
      available: s.onSale ? Math.max(0, s.capacity - taken) : 0,
      onSale: s.onSale,
    };
  }
  return result;
}

export type SeatStatus = "free" | "taken" | "mine";

export interface SeatMap {
  section: {
    id: string;
    name: string;
    standName: string;
    categoryName: string;
    priceAgorot: number;
    gate: string;
    capacity: number;
  };
  available: number;
  rows: { row: number; seats: { id: number; number: number; status: SeatStatus }[] }[];
}

/** Every seat in a section with its status for this buyer and match. */
export async function getSectionSeatMap(
  db: Db,
  input: { matchId: string; sectionId: string; buyerId: string },
  now: Date = new Date(),
): Promise<SeatMap | null> {
  const section = await db.section.findUnique({
    where: { id: input.sectionId },
    include: { stand: true, category: true },
  });
  if (!section) return null;

  const [seats, sold, holds, season] = await Promise.all([
    db.seat.findMany({
      where: { sectionId: section.id },
      orderBy: [{ row: "asc" }, { number: "asc" }],
      select: { id: true, row: true, number: true },
    }),
    db.ticket.findMany({
      where: { matchId: input.matchId, sectionId: section.id },
      select: { seatId: true },
    }),
    db.seatHold.findMany({
      where: { matchId: input.matchId, sectionId: section.id, expiresAt: { gt: now } },
      select: { seatId: true, buyerId: true },
    }),
    db.seasonTicket.findMany({
      where: { season: currentSeason(), sectionId: section.id },
      select: { seatId: true },
    }),
  ]);

  const taken = new Set<number>([...sold, ...season].map((t) => t.seatId));
  const mine = new Set<number>();
  for (const h of holds) (h.buyerId === input.buyerId ? mine : taken).add(h.seatId);

  const rows: SeatMap["rows"] = [];
  let available = 0;
  for (const seat of seats) {
    const status: SeatStatus =
      !section.onSale || taken.has(seat.id) ? "taken" : mine.has(seat.id) ? "mine" : "free";
    if (status === "free") available++;
    const last = rows[rows.length - 1];
    const entry = { id: seat.id, number: seat.number, status };
    if (last && last.row === seat.row) last.seats.push(entry);
    else rows.push({ row: seat.row, seats: [entry] });
  }

  return {
    section: {
      id: section.id,
      name: section.name,
      standName: section.stand.name,
      categoryName: section.category.name,
      priceAgorot: section.category.priceAgorot,
      gate: section.gate,
      capacity: section.capacity,
    },
    available,
    rows,
  };
}
