import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix
});

export default async function middleware(req: NextRequest) {
  const response = intlMiddleware(req);

  const { pathname } = req.nextUrl;

  // Locale-ийг хассан pathname авах
  const pathnameWithoutLocale = pathname.replace(
    /^\/(mn|en)/,
    ''
  );

  if (pathnameWithoutLocale.startsWith('/admin')) {
    const token = await getToken({ req });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL('/admin/auth', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(mn|en)/:path*',
    '/admin/:path*'
  ]
};
