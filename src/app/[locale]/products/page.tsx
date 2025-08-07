import { getTranslations } from "next-intl/server";
import { prisma } from "@/src/lib/prisma";
import ProductGrid from "@/src/components/ProductGrid";
import ProductFilters from "@/src/components/ProductFilters";

async function getProducts(searchParams: any) {
  const where: any = {};

  if (searchParams.category) {
    where.categoryId = searchParams.category;
  }

  if (searchParams.brand) {
    where.brandId = searchParams.brand;
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice)
      where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice)
      where.price.lte = parseFloat(searchParams.maxPrice);
  }

  return await prisma.product.findMany({
    where: { ...where, active: true },
    include: {
      brand: true,
      category: true,
      variants: {
        include: {
          color: true,
          size: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getFilterData() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany(),
    prisma.category.findMany({ where: { active: true } }),
  ]);

  return { brands, categories };
}

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale, namespace: "products" });
  const [products, filterData] = await Promise.all([
    getProducts(searchParams),
    getFilterData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            brands={filterData.brands}
            categories={filterData.categories}
            locale={locale}
          />
        </aside>

        <div className="flex-1">
          <ProductGrid products={products as any} locale={locale} />
        </div>
      </div>
    </div>
  );
}
