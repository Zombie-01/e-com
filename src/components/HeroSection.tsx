"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl"; // <-- import this

interface Banner {
  id: string;
  image: string;
  mnTitle: string;
  enTitle: string;
  url: string;
}

export default function HeroSection({
  banners,
  locale,
}: {
  banners: Banner[];
  locale: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslations("home"); // <-- use this instead of getTranslations

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Premium E-Commerce</h1>
          <p className="text-xl">
            Discover luxury products crafted for modern living
          </p>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section className="relative aspect-video sm:aspect-auto sm:h-[700px] max-h-[70vh] overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={
            currentBanner.image ||
            "https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg"
          }
          alt={locale === "mn" ? currentBanner.mnTitle : currentBanner.enTitle}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        {currentBanner?.mnTitle != "1" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {locale === "mn"
                  ? currentBanner.mnTitle
                  : currentBanner.enTitle}
              </h1>
            </div>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + banners.length) % banners.length
              )
            }>
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % banners.length)
            }>
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
