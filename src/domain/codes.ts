import { randomInt } from "node:crypto";

// No 0/O or 1/I so codes can be read aloud at the gate.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Ticket code like "K7QM2-XH4PA". Uniqueness is enforced by the database. */
export function generateTicketCode(): string {
  let s = "";
  for (let i = 0; i < 10; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}
