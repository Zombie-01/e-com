import { getTranslations } from 'next-intl/server'
import { prisma } from '@/src/lib/prisma'
import HeroSection from '@/src/components/HeroSection'
import FeaturedProducts from '@/src/components/FeaturedProducts'
import CategoryGrid from '@/src/components/CategoryGrid'

async function getBanners() {
  return await prisma.banner.findMany({
    where: { active: true },
    take: 5
  })
}

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      variants: {
        include: {
          color: true,
          size: true
        }
      }
    },
    take: 8,
    orderBy: { createdAt: 'desc' }
  })
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true
    }
  })
}

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const [banners, products, categories] = await Promise.all([
    getBanners(),
    getFeaturedProducts(),
    getCategories()
  ])
  console.log({ banners, products, categories })

  return (
    <div className="space-y-16">
      <HeroSection banners={banners} locale={locale} />
      
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('featured')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products
          </p>
        </div>
        <FeaturedProducts products={products} locale={locale} />
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('categories')}
            </h2>
          </div>
          <CategoryGrid categories={categories} locale={locale} />
        </div>
      </section>
    </div>
  )
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'mn' }
  ]
}