import { z } from "zod";

export const seatActionSchema = z.object({
  matchId: z.string().min(1).max(64),
  seatId: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  matchId: z.string().min(1).max(64),
});

export const seasonPurchaseSchema = z.object({
  planId: z.string().min(1).max(32),
});
