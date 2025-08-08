import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import ProductDetails from "@/src/components/ProductDetails";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      tags: true,
      variants: {
        include: {
          color: true,
          size: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return product;
}

export default async function ProductPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const product = await getProduct(id);

  

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product as any} locale={locale as any} />
    </div>
  );
}
