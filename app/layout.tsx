import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionWrapper from "@/src/components/SessionWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orchid - Office Supplies & Equipment",
  description:
    "Premium office goods and supplies for a modern workspace.",
  alternates: {
    canonical: "https://orchid.mn/",
    languages: {
      en: "https://orchid.mn/en",
      mn: "https://orchid.mn/mn",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
