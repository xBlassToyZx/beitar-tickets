import { DEMO_MATCHES, SEASON_PLANS } from "@/domain/catalog";
import { generateTicketCode } from "@/domain/codes";
import { CATEGORIES, STANDS } from "@/domain/stadium/categories";
import { buildRows } from "@/domain/stadium/rows";
import { SECTIONS } from "@/domain/stadium/sections";
import type { SectionDefinition } from "@/domain/stadium/types";
import type { Db } from "./prisma";

const CHUNK = 1_000;
export const SIMULATED_BUYER = "simulated-sales";

async function inChunks<T>(items: T[], write: (chunk: T[]) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += CHUNK) await write(items.slice(i, i + CHUNK));
}

/** Upserts stands, categories and sections, and creates seats for sections that have none. */
export async function seedReferenceData(
  db: Db,
  sections: readonly SectionDefinition[] = SECTIONS,
): Promise<{ sections: number; seats: number; matches: number; plans: number }> {
  for (const [id, name] of Object.entries(STANDS)) {
    await db.stand.upsert({ where: { id }, create: { id, name }, update: { name } });
  }
  for (const c of Object.values(CATEGORIES)) {
    const data = { name: c.name, shortName: c.shortName, priceAgorot: c.priceAgorot };
    await db.priceCategory.upsert({
      where: { id: c.id },
      create: { id: c.id, ...data },
      update: data,
    });
  }

  let seats = 0;
  for (const s of sections) {
    const data = {
      label: s.label,
      name: s.name,
      standId: s.stand,
      categoryId: s.category,
      capacity: s.capacity,
      gate: s.gate,
      onSale: s.onSale,
    };
    await db.section.upsert({ where: { id: s.id }, create: { id: s.id, ...data }, update: data });

    const existing = await db.seat.count({ where: { sectionId: s.id } });
    if (existing === 0) {
      const rows = buildRows(s.capacity).flatMap((count, i) =>
        Array.from({ length: count }, (_, n) => ({ sectionId: s.id, row: i + 1, number: n + 1 })),
      );
      await inChunks(rows, (chunk) => db.seat.createMany({ data: chunk }));
      seats += rows.length;
    } else {
      seats += existing;
    }
  }

  for (const [i, p] of SEASON_PLANS.entries()) {
    const data = {
      name: p.name,
      priceAgorot: p.priceAgorot,
      categoryIds: p.categoryIds.join(","),
      features: JSON.stringify(p.features),
      featured: p.featured,
      sortOrder: i,
    };
    await db.seasonPlan.upsert({
      where: { id: p.id },
      create: { id: p.id, ...data },
      update: data,
    });
  }

  for (const m of DEMO_MATCHES) {
    const data = { opponent: m.opponent, competition: m.competition, kickoff: new Date(m.kickoff) };
    await db.match.upsert({
      where: { slug: m.slug },
      create: { slug: m.slug, ...data },
      update: data,
    });
  }

  return {
    sections: sections.length,
    seats,
    matches: DEMO_MATCHES.length,
    plans: SEASON_PLANS.length,
  };
}

/** Deterministic PRNG so every developer gets the same demo map. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Marks a share of seats as sold for each demo match, using the match's demand level.
 * Rows further back sell slightly better, like a real stadium. Skips matches that already have sales.
 */
export async function seedSimulatedSales(db: Db): Promise<number> {
  const sections = await db.section.findMany({
    where: { onSale: true },
    include: { category: true },
  });
  const seats = await db.seat.findMany({ select: { id: true, sectionId: true, row: true } });
  const bySection = new Map<string, { id: number; row: number }[]>();
  for (const seat of seats) {
    const list = bySection.get(seat.sectionId) ?? [];
    list.push(seat);
    bySection.set(seat.sectionId, list);
  }

  let total = 0;
  for (const def of DEMO_MATCHES) {
    const match = await db.match.findUniqueOrThrow({ where: { slug: def.slug } });
    if ((await db.ticket.count({ where: { matchId: match.id } })) > 0) continue;

    const random = mulberry32(hash(def.slug));
    const tickets: {
      code: string;
      matchId: string;
      seatId: number;
      sectionId: string;
      buyerId: string;
      priceAgorot: number;
    }[] = [];

    for (const section of sections) {
      const list = bySection.get(section.id) ?? [];
      const rowCount = list.reduce((max, s) => Math.max(max, s.row), 1);
      for (const seat of list) {
        const p = Math.min(0.97, def.demand * (0.6 + (seat.row / rowCount) * 0.5));
        if (random() < p) {
          tickets.push({
            code: generateTicketCode(),
            matchId: match.id,
            seatId: seat.id,
            sectionId: section.id,
            buyerId: SIMULATED_BUYER,
            priceAgorot: section.category.priceAgorot,
          });
        }
      }
    }

    const order = await db.order.create({
      data: {
        buyerId: SIMULATED_BUYER,
        kind: "MATCH",
        matchId: match.id,
        totalAgorot: tickets.reduce((sum, t) => sum + t.priceAgorot, 0),
      },
    });
    await inChunks(tickets, (chunk) =>
      db.ticket.createMany({ data: chunk.map((t) => ({ ...t, orderId: order.id })) }),
    );
    total += tickets.length;
  }
  return total;
}
