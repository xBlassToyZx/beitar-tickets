/**
 * Seeds reference data (stadium layout, price categories, season plans, demo fixtures)
 * and, unless SEED_SIMULATED_SALES=false, simulated ticket sales so the map looks realistic.
 *
 * Safe to run more than once: reference data is upserted and sales are generated only for
 * matches that have none yet.
 */
import "dotenv/config";
import { createPrismaClient, type Db } from "../src/server/prisma";
import { seedReferenceData, seedSimulatedSales } from "../src/server/seed";

async function main() {
  const db: Db = createPrismaClient(process.env.DATABASE_URL ?? "file:./prisma/dev.db");
  try {
    const started = Date.now();
    const ref = await seedReferenceData(db);
    console.log(
      `Stadium: ${ref.sections} sections, ${ref.seats.toLocaleString()} seats · ${ref.matches} matches · ${ref.plans} season plans`,
    );
    if (process.env.SEED_SIMULATED_SALES !== "false") {
      const sold = await seedSimulatedSales(db);
      console.log(`Simulated sales: ${sold.toLocaleString()} tickets`);
    }
    console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
