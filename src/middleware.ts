import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix
});

export const config = {
  // Match all pathnames except for:
  // - /api, /trpc, /_next, /_vercel
  // - files with a dot in the name (e.g., favicon.ico)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
