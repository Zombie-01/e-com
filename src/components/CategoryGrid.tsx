import Link from 'next/link'
import { Card, CardContent } from '@/src/components/ui/card'

interface Category {
  id: string
  mnName: string
  enName: string
  children: Category[]
}

export default function CategoryGrid({ 
  categories, 
  locale 
}: { 
  categories: Category[]
  locale: string 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/${locale}/products?category=${category.id}`}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {(locale === 'mn' ? category.mnName : category.enName).charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {locale === 'mn' ? category.mnName : category.enName}
              </h3>
              {category.children.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {category.children.length} subcategories
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}