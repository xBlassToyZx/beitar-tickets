import { currentSeason } from "@/domain/rules";
import type { Db } from "./prisma";

export interface MatchSummary {
  id: string;
  slug: string;
  opponent: string;
  competition: string;
  kickoff: Date;
  available: number;
  capacity: number;
}

/** Upcoming matches with how many seats are left in sections that are on sale. */
export async function listUpcomingMatches(db: Db, now: Date = new Date()): Promise<MatchSummary[]> {
  const [matches, onSale, sold, season] = await Promise.all([
    db.match.findMany({ where: { kickoff: { gt: now } }, orderBy: { kickoff: "asc" } }),
    db.section.aggregate({ where: { onSale: true }, _sum: { capacity: true } }),
    db.ticket.groupBy({ by: ["matchId"], _count: { _all: true } }),
    db.seasonTicket.count({ where: { season: currentSeason() } }),
  ]);
  const capacity = onSale._sum.capacity ?? 0;
  const soldBy = new Map(sold.map((s) => [s.matchId, s._count._all]));
  return matches.map((m) => ({
    id: m.id,
    slug: m.slug,
    opponent: m.opponent,
    competition: m.competition,
    kickoff: m.kickoff,
    capacity,
    available: Math.max(0, capacity - (soldBy.get(m.id) ?? 0) - season),
  }));
}

export async function getMatchBySlug(db: Db, slug: string) {
  return db.match.findUnique({ where: { slug } });
}

export interface WalletTicket {
  id: string;
  code: string;
  kind: "MATCH" | "SEASON";
  title: string;
  subtitle: string;
  when: Date | null;
  standName: string;
  sectionName: string;
  row: number;
  seat: number;
  gate: string;
}

/** Everything the buyer owns: match tickets (upcoming first) and their season ticket. */
export async function getWallet(db: Db, buyerId: string): Promise<WalletTicket[]> {
  const [tickets, seasonTickets] = await Promise.all([
    db.ticket.findMany({
      where: { buyerId },
      include: { match: true, seat: { include: { section: { include: { stand: true } } } } },
      orderBy: [{ match: { kickoff: "asc" } }, { createdAt: "asc" }],
    }),
    db.seasonTicket.findMany({
      where: { buyerId },
      include: { plan: true, seat: { include: { section: { include: { stand: true } } } } },
    }),
  ]);

  return [
    ...seasonTickets.map(
      (t): WalletTicket => ({
        id: t.id,
        code: t.code,
        kind: "SEASON",
        title: `מנוי עונתי ${t.season}`,
        subtitle: t.plan.name,
        when: null,
        standName: t.seat.section.stand.name,
        sectionName: t.seat.section.name,
        row: t.seat.row,
        seat: t.seat.number,
        gate: t.seat.section.gate,
      }),
    ),
    ...tickets.map(
      (t): WalletTicket => ({
        id: t.id,
        code: t.code,
        kind: "MATCH",
        title: `נגד ${t.match.opponent}`,
        subtitle: t.match.competition,
        when: t.match.kickoff,
        standName: t.seat.section.stand.name,
        sectionName: t.seat.section.name,
        row: t.seat.row,
        seat: t.seat.number,
        gate: t.seat.section.gate,
      }),
    ),
  ];
}
