import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const intlResponse = intlMiddleware(req);

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/auth", req.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!admin|api|trpc|_next|_vercel|.*\\..*).*)'
  ]
};
