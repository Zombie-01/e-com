"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";

interface Color {
  id: string;
  name: string;
  hex: string;
}

interface Size {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  image?: string;
  stock: number;
  color: Color;
  size: Size;
}

interface Tag {
  id: string;
  mnName: string;
  enName: string;
}

interface Brand {
  id: string;
  mnName: string;
  enName: string;
}

interface Category {
  id: string;
  mnName: string;
  enName: string;
  parentId?: string | null;
}

interface Product {
  id: string;
  mnName: string;
  enName: string;
  mnDesc: string;
  enDesc: string;
  price: number;
  sku: string;
  brandId: string;
  categoryId: string;
  brand: Brand;
  category: Category;
  tags: Tag[];
  variants: Variant[];
}

interface ProductDetailsProps {
  product: Product;
  locale: "mn" | "en";
}

export default function ProductDetails({
  product,
  locale,
}: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  console.log(JSON.stringify(product));

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < quantity) return;

    addItem({
      id: product.id,
      productId: product.id,
      variantId: selectedVariant.id,
      name: locale === "mn" ? product.mnName : product.enName,
      price: product.price,
      quantity,
      image: selectedVariant.image as string,
      color: selectedVariant.color,
      size: selectedVariant?.size,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={
              selectedVariant?.image ||
              "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg"
            }
            alt={locale === "mn" ? product.mnName : product.enName}
            fill
            className="object-cover"
          />
        </div>

        {product.variants.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedVariant?.id === variant.id
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}>
                <Image
                  src={variant.image}
                  alt={variant.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 mb-2">
            {locale === "mn" ? product.brand.mnName : product.brand.enName}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === "mn" ? product.mnName : product.enName}
          </h1>
          <p className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-gray-700 leading-relaxed">
            {locale === "mn" ? product.mnDesc : product.enDesc}
          </p>
        </div>

        {/* Color Selection */}
        {product.variants.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
            <div className="flex space-x-2">
              {product.variants.map((variant: Variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    variant?.id === variant.id
                      ? "border-gray-900"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: variant.color.hex }}
                  title={variant.color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {product.variants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
            <div className="flex space-x-2">
              {[
                ...new Map(
                  product.variants.map((variant: Variant) => [
                    variant.size.id,
                    variant,
                  ] )
                ).values(),
              ].map((variant: Variant) => (
                <button
                  key={variant.size.id}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`px-4 py-2 text-sm border rounded-md ${
                    selectedSize?.id === variant.size.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}>
                  {variant.size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity & Add to Cart */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2">
              {[...Array(Math.min(selectedVariant?.stock || 0, 10))].map(
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock < quantity}
            size="lg"
            className="w-full">
            {selectedVariant?.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>

        {/* Product Tags */}
        {product.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: Tag) => (
                <Badge key={tag.id} variant="secondary">
                  {locale === "mn" ? tag.mnName : tag.enName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
