"use client";

import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

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
    <footer className="pt-10 pb-4 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Social column */}
          <div>
            <h2 className="text-lg font-bold mb-2">Сошиал холбоос</h2>
            <p className="text-sm mb-4 text-muted-foreground">
              ИМЭЙЛ ХАЯГАА БҮРТГҮҮЛЭЭД ХУДАЛДААНЫ ТАЛААРХ ШИНЭ, СОНИРХОЛТОЙ
              МЭДЭЭЛЛИЙГ ХҮЛЭЭН АВААРАЙ.
            </p>
            <form className="flex mb-4">
              <input
                type="email"
                placeholder="Таны имэйл хаяг"
                className="rounded-l px-3 py-1 text-black w-full"
              />
              <button
                type="submit"
                className="bg-white text-[#36384C] px-3 py-1 rounded-r">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M2 12h20m0 0l-7-7m7 7l-7 7"
                    stroke="#36384C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
            <div className="flex space-x-4 mt-2 ">
              <Link href="#" aria-label="Instagram">
                <Instagram />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Youtube />
              </Link>
            </div>
          </div>
          {/* "Миний бүртгэл" */}
          <div>
            <h3 className="mb-3 font-semibold text-lg">Миний бүртгэл</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/auth/signin" className="hover:underline">
                  Нэвтрье
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:underline">
                  Бүртгэл үүсгэх
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline">
                  Захиалгууд
                </Link>
              </li>
            </ul>
          </div>
          {/* "GoldenPen.mn" */}
          <div>
            <h3 className="mb-3 font-semibold text-lg">GoldenPen.mn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:underline">
                  Брэндүүд
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Холбогдох
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Бидний тухай
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
            </ul>
          </div>
          {/* "Дэлгүүрийн" */}
          <div>
            <h3 className="mb-3 font-semibold text-lg">Дэлгүүрийн</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:underline">
                  Салбар, хаяг
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Хүргэлт
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Буцаалт
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-600 pt-4 text-xs text-center text-gray-300">
          ©{new Date().getFullYear()} Зохиогчийн эрх хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
};
