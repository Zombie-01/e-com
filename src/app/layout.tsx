import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Orchid - Office Supplies & Equipment",
  description:
    "Premium office goods and supplies for a modern workspace. Find quality office products with excellent service.",
  keywords: [
    "office supplies",
    "office equipment",
    "office goods",
    "stationery",
    "office furniture",
    "оффис бараа",
    "оффисын хэрэгсэл",
    "оффис тоног төхөөрөмж",
    "ажлын хэрэгсэл",
    "ажлын орчин",
    "орчин үеийн дизайн",
  ].join(", "),
  alternates: {
    canonical: "https://orchid.mn/",
    languages: {
      en: "https://orchid.mn/en",
      mn: "https://orchid.mn/mn",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
