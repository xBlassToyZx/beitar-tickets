import "server-only";
import { cookies } from "next/headers";
import { BUYER_COOKIE } from "@/lib/buyer-cookie";

/** The anonymous buyer id set by middleware. */
export async function getBuyerId(): Promise<string> {
  const id = (await cookies()).get(BUYER_COOKIE)?.value;
  if (!id) throw new Error("Missing buyer cookie; middleware should have set it.");
  return id;
}
