import { z } from "zod";
import { getCart } from "@/server/booking";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const matchId = z.string().min(1).parse(new URL(req.url).searchParams.get("matchId"));
    return getCart(db, { buyerId: await getBuyerId(), matchId });
  });
}
