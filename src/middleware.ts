import { NextResponse, type NextRequest } from "next/server";
import { BUYER_COOKIE } from "@/lib/buyer-cookie";

/**
 * Gives every visitor an anonymous buyer id in an httpOnly cookie, so holds and tickets
 * can be tied to a browser without accounts. Replace with real auth when it is added.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(BUYER_COOKIE)) return NextResponse.next();

  const id = crypto.randomUUID();
  // Make the id visible to this same request's server code.
  request.cookies.set(BUYER_COOKIE, id);
  const response = NextResponse.next({ request });
  response.cookies.set(BUYER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
