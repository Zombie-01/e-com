'use client'

import { useTranslations } from 'next-intl'
import { useCartStore } from '@/src/lib/store'
import CartItem from '@/src/components/CartItem'
import { Button } from '@/src/components/ui/button'
import Link from 'next/link'

export default function CartPage() {
  const t = useTranslations('cart')
  const { items, getTotalPrice, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('empty')}
          </p>
          <Link href="/products">
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t('title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.variantId} item={item} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg h-fit">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>{t('total')}</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full mb-3" size="lg">
            {t('checkout')}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  )
}