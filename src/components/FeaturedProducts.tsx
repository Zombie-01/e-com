import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useTranslations } from "next-intl";

interface Product {
  id: string;
  mnName: string;
  enName: string;
  price: number;
  brand: {
    mnName: string;
    enName: string;
  };
  variants: Array<{
    image: string;
  }>;
}

export default function FeaturedProducts({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/${locale}/products/${product.id}`}>
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 bg-white">
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={
                    product.variants[0]?.image ||
                    "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg"
                  }
                  alt={locale === "mn" ? product.mnName : product.enName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-black/80 text-white">
                  {t("products.new")}
                </Badge>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">
                  {locale === "mn"
                    ? product.brand.mnName
                    : product.brand.enName}
                </p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {locale === "mn" ? product.mnName : product.enName}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  ₮{product.price.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
