import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SectionDefinition } from "@/domain/stadium/types";
import { getMatchAvailability, getSectionSeatMap } from "@/server/availability";
import { checkout, getCart, holdSeat, releaseSeat } from "@/server/booking";
import { BookingError } from "@/server/errors";
import type { Db } from "@/server/prisma";
import { purchaseSeasonTicket } from "@/server/season";
import { seedReferenceData } from "@/server/seed";
import { createTestDb } from "../helpers/test-db";

const NOW = new Date("2026-10-26T12:00:00+02:00");
const MINUTE = 60_000;

const SECTIONS: SectionDefinition[] = [
  {
    id: "T1",
    label: "T1",
    name: "גוש בדיקה",
    stand: "E",
    category: "E",
    capacity: 12,
    gate: "1",
    onSale: true,
    shape: { kind: "rect", x: 0, y: 0, w: 1, h: 1 },
  },
  {
    id: "TX",
    label: "TX",
    name: "גוש סגור",
    stand: "A",
    category: "AW",
    capacity: 4,
    gate: "2",
    onSale: false,
    shape: { kind: "rect", x: 0, y: 0, w: 1, h: 1 },
  },
];

let db: Db;
let cleanup: () => Promise<void>;
let matchId: string;
let seats: number[];
let closedSeat: number;

beforeEach(async () => {
  ({ db, cleanup } = createTestDb());
  await seedReferenceData(db, SECTIONS);
  matchId = (await db.match.findFirstOrThrow({ orderBy: { kickoff: "asc" } })).id;
  seats = (await db.seat.findMany({ where: { sectionId: "T1" }, orderBy: { id: "asc" } })).map(
    (s) => s.id,
  );
  closedSeat = (await db.seat.findFirstOrThrow({ where: { sectionId: "TX" } })).id;
});

afterEach(async () => cleanup());

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(BookingError);
  await expect(promise).rejects.toMatchObject({ code });
}

const seat = (i: number) => seats[i]!;

describe("holding seats", () => {
  it("reserves a seat and shows it in the buyer's cart", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    const cart = await getCart(db, { buyerId: "a", matchId }, NOW);
    expect(cart.lines).toHaveLength(1);
    expect(cart.totalAgorot).toBe(8_000);
  });

  it("does not let a second buyer take a held seat", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await expectCode(holdSeat(db, { buyerId: "b", matchId, seatId: seat(0) }, NOW), "SEAT_TAKEN");
  });

  it("frees a seat once the hold expires", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    const later = new Date(NOW.getTime() + 11 * MINUTE);
    await expect(
      holdSeat(db, { buyerId: "b", matchId, seatId: seat(0) }, later),
    ).resolves.toBeDefined();
  });

  it("is idempotent for the same buyer", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    expect((await getCart(db, { buyerId: "a", matchId }, NOW)).lines).toHaveLength(1);
  });

  it("limits a buyer to 4 seats per match", async () => {
    for (let i = 0; i < 4; i++) await holdSeat(db, { buyerId: "a", matchId, seatId: seat(i) }, NOW);
    await expectCode(
      holdSeat(db, { buyerId: "a", matchId, seatId: seat(4) }, NOW),
      "LIMIT_REACHED",
    );
  });

  it("refuses seats in closed sections", async () => {
    await expectCode(
      holdSeat(db, { buyerId: "a", matchId, seatId: closedSeat }, NOW),
      "SECTION_CLOSED",
    );
  });

  it("lets the buyer release a seat", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await releaseSeat(db, { buyerId: "a", matchId, seatId: seat(0) });
    expect((await getCart(db, { buyerId: "a", matchId }, NOW)).lines).toHaveLength(0);
  });
});

describe("checkout", () => {
  it("turns held seats into tickets and clears the cart", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(1) }, NOW);
    const result = await checkout(db, { buyerId: "a", matchId }, NOW);
    expect(result).toMatchObject({ ticketCount: 2, totalAgorot: 16_000 });
    expect(await db.ticket.count({ where: { buyerId: "a" } })).toBe(2);
    expect((await getCart(db, { buyerId: "a", matchId }, NOW)).lines).toHaveLength(0);
  });

  it("counts bought tickets toward the 4-seat limit", async () => {
    for (let i = 0; i < 3; i++) await holdSeat(db, { buyerId: "a", matchId, seatId: seat(i) }, NOW);
    await checkout(db, { buyerId: "a", matchId }, NOW);
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(3) }, NOW);
    await expectCode(
      holdSeat(db, { buyerId: "a", matchId, seatId: seat(4) }, NOW),
      "LIMIT_REACHED",
    );
  });

  it("refuses an empty cart", async () => {
    await expectCode(checkout(db, { buyerId: "a", matchId }, NOW), "CART_EMPTY");
  });

  it("refuses a cart whose hold has expired", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    const later = new Date(NOW.getTime() + 11 * MINUTE);
    await expectCode(checkout(db, { buyerId: "a", matchId }, later), "HOLD_EXPIRED");
  });

  it("never sells the same seat twice", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await checkout(db, { buyerId: "a", matchId }, NOW);
    // A stale hold for buyer b on the sold seat, written directly to bypass the hold checks.
    await db.seatHold.create({
      data: {
        matchId,
        seatId: seat(0),
        sectionId: "T1",
        buyerId: "b",
        expiresAt: new Date(NOW.getTime() + 5 * MINUTE),
      },
    });
    await expectCode(checkout(db, { buyerId: "b", matchId }, NOW), "SEAT_TAKEN");
    expect(await db.ticket.count({ where: { seatId: seat(0), matchId } })).toBe(1);
  });

  it("closes sales once the match has kicked off", async () => {
    const match = await db.match.findUniqueOrThrow({ where: { id: matchId } });
    const afterKickoff = new Date(match.kickoff.getTime() + MINUTE);
    await expectCode(
      holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, afterKickoff),
      "MATCH_STARTED",
    );
  });
});

describe("availability", () => {
  it("subtracts sold and held seats", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await checkout(db, { buyerId: "a", matchId }, NOW);
    await holdSeat(db, { buyerId: "b", matchId, seatId: seat(1) }, NOW);
    const availability = await getMatchAvailability(db, matchId, NOW);
    expect(availability.T1).toEqual({ capacity: 12, available: 10, onSale: true });
    expect(availability.TX?.available).toBe(0);
  });

  it("shows the buyer's own holds as theirs and others' as taken", async () => {
    await holdSeat(db, { buyerId: "a", matchId, seatId: seat(0) }, NOW);
    await holdSeat(db, { buyerId: "b", matchId, seatId: seat(1) }, NOW);
    const map = await getSectionSeatMap(db, { matchId, sectionId: "T1", buyerId: "a" }, NOW);
    const all = map!.rows.flatMap((r) => r.seats);
    expect(all.find((s) => s.id === seat(0))?.status).toBe("mine");
    expect(all.find((s) => s.id === seat(1))?.status).toBe("taken");
    expect(map!.available).toBe(10);
  });
});

describe("season tickets", () => {
  it("assigns a free seat and blocks it for every match", async () => {
    await db.seasonPlan.update({ where: { id: "EAST" }, data: { categoryIds: "E" } });
    const { seasonTicketId } = await purchaseSeasonTicket(
      db,
      { buyerId: "a", planId: "EAST" },
      NOW,
    );
    const ticket = await db.seasonTicket.findUniqueOrThrow({ where: { id: seasonTicketId } });
    expect(ticket.sectionId).toBe("T1");
    await expectCode(
      holdSeat(db, { buyerId: "b", matchId, seatId: ticket.seatId }, NOW),
      "SEAT_TAKEN",
    );
  });

  it("allows one season ticket per buyer", async () => {
    await purchaseSeasonTicket(db, { buyerId: "a", planId: "EAST" }, NOW);
    await expectCode(
      purchaseSeasonTicket(db, { buyerId: "a", planId: "EAST" }, NOW),
      "ALREADY_SUBSCRIBED",
    );
  });
});
