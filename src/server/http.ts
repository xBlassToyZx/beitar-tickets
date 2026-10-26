import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BookingError } from "./errors";

export interface ApiErrorBody {
  error: { code: string; message: string };
}

/** Wraps a route handler: known errors become JSON with the right status, others become 500. */
export async function handle<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data ?? { ok: true });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json<ApiErrorBody>(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json<ApiErrorBody>(
        { error: { code: "INVALID_REQUEST", message: "הבקשה לא תקינה." } },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json<ApiErrorBody>(
      { error: { code: "INTERNAL", message: "משהו השתבש. נסה שוב בעוד רגע." } },
      { status: 500 },
    );
  }
}
