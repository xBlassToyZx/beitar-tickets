import { generateTicketCode } from "@/domain/codes";
import { currentSeason } from "@/domain/rules";
import { BookingError } from "./errors";
import { isUniqueViolation, type Db } from "./prisma";

export interface SeasonPlanView {
  id: string;
  name: string;
  priceAgorot: number;
  features: string[];
  featured: boolean;
}

export async function listSeasonPlans(db: Db): Promise<SeasonPlanView[]> {
  const plans = await db.seasonPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    priceAgorot: p.priceAgorot,
    features: JSON.parse(p.features) as string[],
    featured: p.featured,
  }));
}

export async function getSeasonTicket(db: Db, buyerId: string) {
  return db.seasonTicket.findUnique({
    where: { season_buyerId: { season: currentSeason(), buyerId } },
    include: { plan: true },
  });
}

/**
 * Buys a season ticket: assigns the best free seat in the plan's categories, meaning a seat
 * that is not sold or held for any upcoming match and has no season ticket yet.
 * One season ticket per buyer per season.
 */
export async function purchaseSeasonTicket(
  db: Db,
  input: { buyerId: string; planId: string },
  now: Date = new Date(),
): Promise<{ seasonTicketId: string }> {
  const season = currentSeason();
  try {
    return await db.$transaction(async (tx) => {
      const plan = await tx.seasonPlan.findUnique({ where: { id: input.planId } });
      if (!plan) throw new BookingError("PLAN_NOT_FOUND", "המנוי לא נמצא.");

      const existing = await tx.seasonTicket.findUnique({
        where: { season_buyerId: { season, buyerId: input.buyerId } },
      });
      if (existing) {
        throw new BookingError("ALREADY_SUBSCRIBED", `כבר יש לך מנוי לעונת ${season}.`);
      }

      const seat = await tx.seat.findFirst({
        where: {
          section: { onSale: true, categoryId: { in: plan.categoryIds.split(",") } },
          seasonTickets: { none: { season } },
          tickets: { none: { match: { kickoff: { gt: now } } } },
          holds: { none: { expiresAt: { gt: now } } },
        },
        orderBy: [{ row: "asc" }, { number: "asc" }],
      });
      if (!seat) throw new BookingError("SOLD_OUT", "אין כרגע מושבים פנויים למנוי הזה.");

      const order = await tx.order.create({
        data: { buyerId: input.buyerId, kind: "SEASON", totalAgorot: plan.priceAgorot },
      });
      const ticket = await tx.seasonTicket.create({
        data: {
          code: generateTicketCode(),
          season,
          planId: plan.id,
          orderId: order.id,
          seatId: seat.id,
          sectionId: seat.sectionId,
          buyerId: input.buyerId,
        },
      });
      return { seasonTicketId: ticket.id };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new BookingError("SEAT_TAKEN", "המושב שנבחר נתפס בדיוק עכשיו. נסה שוב.");
    }
    throw error;
  }
}
