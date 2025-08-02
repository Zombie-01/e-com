import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import SessionWrapper from '@/src/components/SessionWrapper'
import Navigation from '@/src/components/Navigation'
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
      <NextIntlClientProvider>
        <SessionWrapper>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navigation locale={locale} />
            <main>{children}</main>
          </div>
        </SessionWrapper>
      </NextIntlClientProvider>
  )
}