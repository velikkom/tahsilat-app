import { NextResponse } from "next/server";
import { looksLikeUnexpiredJwt, PUBLIC_ROUTES } from "./middlewareAuth";

export function middleware(request) {
  const tokenCookie = request.cookies.get("token");
  const hasValidLookingSession = looksLikeUnexpiredJwt(tokenCookie?.value);
  const pathname = request.nextUrl.pathname;

  if (!hasValidLookingSession && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasValidLookingSession && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/collections/:path*",
    "/trips/:path*",
    "/admin/:path*",
    "/profile",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
