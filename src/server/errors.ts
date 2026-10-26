/** Errors the API returns to the client with a readable Hebrew message. */
export type BookingErrorCode =
  | "MATCH_NOT_FOUND"
  | "SECTION_NOT_FOUND"
  | "SECTION_CLOSED"
  | "SEAT_NOT_FOUND"
  | "SEAT_TAKEN"
  | "LIMIT_REACHED"
  | "CART_EMPTY"
  | "HOLD_EXPIRED"
  | "PLAN_NOT_FOUND"
  | "ALREADY_SUBSCRIBED"
  | "SOLD_OUT"
  | "MATCH_STARTED";

const STATUS: Record<BookingErrorCode, number> = {
  MATCH_NOT_FOUND: 404,
  SECTION_NOT_FOUND: 404,
  SEAT_NOT_FOUND: 404,
  PLAN_NOT_FOUND: 404,
  SECTION_CLOSED: 409,
  SEAT_TAKEN: 409,
  LIMIT_REACHED: 409,
  CART_EMPTY: 409,
  HOLD_EXPIRED: 409,
  ALREADY_SUBSCRIBED: 409,
  SOLD_OUT: 409,
  MATCH_STARTED: 409,
};

export class BookingError extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }

  get status(): number {
    return STATUS[this.code];
  }
}
