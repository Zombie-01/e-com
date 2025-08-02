'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Checkbox } from '@/src/components/ui/checkbox'

interface Brand {
  id: string
  mnName: string
  enName: string
}

interface Category {
  id: string
  mnName: string
  enName: string
}

export default function ProductFilters({
  brands,
  categories,
  locale
}: {
  brands: Brand[]
  categories: Category[]
  locale: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand')?.split(',') || []
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',') || []
  )

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
    
    router.push(`/${locale}/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedBrands([])
    setSelectedCategories([])
    router.push(`/${locale}/products`)
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Brands */}
        <div>
          <Label className="text-sm font-medium">Brand</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={brand.id}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand.id])
                    } else {
                      setSelectedBrands(selectedBrands.filter(id => id !== brand.id))
                    }
                  }}
                />
                <Label htmlFor={brand.id} className="text-sm">
                  {locale === 'mn' ? brand.mnName : brand.enName}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category.id])
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                    }
                  }}
                />
                <Label htmlFor={category.id} className="text-sm">
                  {locale === 'mn' ? category.mnName : category.enName}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}