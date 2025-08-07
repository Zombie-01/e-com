"use client";

import { useTranslations } from "next-intl";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  menuItems?: MenuItem[];
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

export const Footer = ({ menuItems = [], bottomLinks = [] }: FooterProps) => {
  const t = useTranslations("footer");

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <footer>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h2 className="text-xl font-bold">{t("logoText")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("tagline")}
              </p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-3 font-semibold">{t(section.title)}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href={link.url} className="hover:text-primary">
                        {t(link.text)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>{t("copyright")}</p>
            <ul className="flex flex-wrap gap-3">
              {bottomLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} className="hover:text-primary underline">
                    {t(link.text)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};
