import { generateTicketCode } from "@/domain/codes";
import { currentSeason, MAX_TICKETS_PER_MATCH, seatHoldMinutes } from "@/domain/rules";
import { BookingError } from "./errors";
import { isUniqueViolation, type Db } from "./prisma";

type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];

async function requireOpenMatch(tx: Tx, matchId: string, now: Date) {
  const match = await tx.match.findUnique({ where: { id: matchId } });
  if (!match) throw new BookingError("MATCH_NOT_FOUND", "המשחק לא נמצא.");
  if (match.kickoff <= now) {
    throw new BookingError("MATCH_STARTED", "המכירה למשחק הזה נסגרה.");
  }
  return match;
}

/**
 * Reserves one seat for the buyer for a few minutes. Picking the same seat again is a no-op.
 * Every new seat restarts the cart timer for all of the buyer's seats in this match.
 */
export async function holdSeat(
  db: Db,
  input: { buyerId: string; matchId: string; seatId: number },
  now: Date = new Date(),
): Promise<{ expiresAt: Date }> {
  const expiresAt = new Date(now.getTime() + seatHoldMinutes() * 60_000);
  try {
    return await db.$transaction(async (tx) => {
      await requireOpenMatch(tx, input.matchId, now);

      const seat = await tx.seat.findUnique({
        where: { id: input.seatId },
        include: { section: true },
      });
      if (!seat) throw new BookingError("SEAT_NOT_FOUND", "המושב לא נמצא.");
      if (!seat.section.onSale) {
        throw new BookingError("SECTION_CLOSED", "הגוש הזה סגור למכירה.");
      }

      await tx.seatHold.deleteMany({ where: { matchId: input.matchId, expiresAt: { lte: now } } });

      const [sold, season, existing] = await Promise.all([
        tx.ticket.findUnique({
          where: { matchId_seatId: { matchId: input.matchId, seatId: seat.id } },
        }),
        tx.seasonTicket.findUnique({
          where: { season_seatId: { season: currentSeason(), seatId: seat.id } },
        }),
        tx.seatHold.findUnique({
          where: { matchId_seatId: { matchId: input.matchId, seatId: seat.id } },
        }),
      ]);
      if (sold || season || (existing && existing.buyerId !== input.buyerId)) {
        throw new BookingError("SEAT_TAKEN", "המושב הזה כבר נתפס. בחר מושב אחר.");
      }

      if (!existing) {
        const [held, owned] = await Promise.all([
          tx.seatHold.count({ where: { buyerId: input.buyerId, matchId: input.matchId } }),
          tx.ticket.count({ where: { buyerId: input.buyerId, matchId: input.matchId } }),
        ]);
        if (held + owned >= MAX_TICKETS_PER_MATCH) {
          throw new BookingError(
            "LIMIT_REACHED",
            `אפשר לרכוש עד ${MAX_TICKETS_PER_MATCH} כרטיסים למשחק.`,
          );
        }
        await tx.seatHold.create({
          data: {
            matchId: input.matchId,
            seatId: seat.id,
            sectionId: seat.sectionId,
            buyerId: input.buyerId,
            expiresAt,
          },
        });
      }

      await tx.seatHold.updateMany({
        where: { buyerId: input.buyerId, matchId: input.matchId },
        data: { expiresAt },
      });
      return { expiresAt };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new BookingError("SEAT_TAKEN", "המושב הזה כבר נתפס. בחר מושב אחר.");
    }
    throw error;
  }
}

export async function releaseSeat(
  db: Db,
  input: { buyerId: string; matchId: string; seatId: number },
): Promise<void> {
  await db.seatHold.deleteMany({
    where: { buyerId: input.buyerId, matchId: input.matchId, seatId: input.seatId },
  });
}

export interface CartLine {
  seatId: number;
  sectionId: string;
  sectionName: string;
  row: number;
  number: number;
  priceAgorot: number;
}

export interface Cart {
  lines: CartLine[];
  totalAgorot: number;
  expiresAt: Date | null;
  ownedForMatch: number;
}

export async function getCart(
  db: Db,
  input: { buyerId: string; matchId: string },
  now: Date = new Date(),
): Promise<Cart> {
  const [holds, ownedForMatch] = await Promise.all([
    db.seatHold.findMany({
      where: { buyerId: input.buyerId, matchId: input.matchId, expiresAt: { gt: now } },
      include: { seat: { include: { section: { include: { category: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.ticket.count({ where: { buyerId: input.buyerId, matchId: input.matchId } }),
  ]);
  const lines = holds.map((h) => ({
    seatId: h.seatId,
    sectionId: h.sectionId,
    sectionName: h.seat.section.name,
    row: h.seat.row,
    number: h.seat.number,
    priceAgorot: h.seat.section.category.priceAgorot,
  }));
  return {
    lines,
    totalAgorot: lines.reduce((sum, l) => sum + l.priceAgorot, 0),
    expiresAt: holds.reduce<Date | null>(
      (min, h) => (min === null || h.expiresAt < min ? h.expiresAt : min),
      null,
    ),
    ownedForMatch,
  };
}

/**
 * Turns the buyer's held seats into tickets in one transaction.
 * The unique (match, seat) index on Ticket guarantees a seat is never sold twice.
 * Payment is simulated: no money changes hands.
 */
export async function checkout(
  db: Db,
  input: { buyerId: string; matchId: string },
  now: Date = new Date(),
): Promise<{ orderId: string; ticketCount: number; totalAgorot: number }> {
  try {
    return await db.$transaction(async (tx) => {
      await requireOpenMatch(tx, input.matchId, now);
      const holds = await tx.seatHold.findMany({
        where: { buyerId: input.buyerId, matchId: input.matchId },
        include: { seat: { include: { section: { include: { category: true } } } } },
      });
      if (holds.length === 0) throw new BookingError("CART_EMPTY", "לא נבחרו מושבים.");
      if (holds.some((h) => h.expiresAt <= now)) {
        await tx.seatHold.deleteMany({
          where: { buyerId: input.buyerId, matchId: input.matchId, expiresAt: { lte: now } },
        });
        throw new BookingError(
          "HOLD_EXPIRED",
          "הזמן לשמירת המושבים נגמר. בחר אותם שוב כדי להמשיך.",
        );
      }

      const totalAgorot = holds.reduce((sum, h) => sum + h.seat.section.category.priceAgorot, 0);
      const order = await tx.order.create({
        data: { buyerId: input.buyerId, kind: "MATCH", matchId: input.matchId, totalAgorot },
      });
      await tx.ticket.createMany({
        data: holds.map((h) => ({
          code: generateTicketCode(),
          orderId: order.id,
          matchId: input.matchId,
          seatId: h.seatId,
          sectionId: h.sectionId,
          buyerId: input.buyerId,
          priceAgorot: h.seat.section.category.priceAgorot,
        })),
      });
      await tx.seatHold.deleteMany({
        where: { buyerId: input.buyerId, matchId: input.matchId },
      });
      return { orderId: order.id, ticketCount: holds.length, totalAgorot };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new BookingError("SEAT_TAKEN", "אחד המושבים נמכר בינתיים. בחר מושב אחר.");
    }
    throw error;
  }
}
