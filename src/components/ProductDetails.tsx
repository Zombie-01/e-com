"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useTranslations } from "next-intl";

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
  image?: string[]; // array of image URLs
  stock: number;
  active: boolean;
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
  active: boolean;
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
  const t = useTranslations("products");
  const { addItem } = useCartStore();
  // Flatten all images from all variants for thumbnails
  const allImages = product.variants.flatMap((v) => v.image || []);

  // State: selected variant, size, image, quantity
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(
    product.variants[0]?.size
  );
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    product.variants[0]?.color
  );
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    product.variants[0]?.image?.[0] || allImages[0]
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < quantity) return;

    addItem({
      id: product.id,
      productId: product.id,
      variantId: selectedVariant.id,
      name: locale === "mn" ? product.mnName : product.enName,
      price: product.price,
      quantity,
      image: selectedVariant.image?.[0] || "",
      color: selectedVariant.color,
      size: selectedVariant.size,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={
              selectedImage ||
              "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg"
            }
            alt={locale === "mn" ? product.mnName : product.enName}
            fill
            className="object-cover"
          />
        </div>

        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 focus:outline-none focus:ring-2 ${
                  selectedImage === img
                    ? "border-blue-500 ring-blue-500"
                    : "border-gray-200"
                }`}>
                <Image
                  src={img}
                  alt={`${
                    locale === "mn" ? product.mnName : product.enName
                  } image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 mb-2">
            {locale === "mn" ? product.brand.mnName : product.brand.enName}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === "mn" ? product.mnName : product.enName}
          </h1>
          <p className="text-2xl font-bold text-blue-600">
            ₮{product.price.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gray-700 leading-relaxed">
            {locale === "mn" ? product.mnDesc : product.enDesc}
          </p>
        </div>

        {/* Color selector */}
        {product.variants.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("color")}
            </h3>
            <div className="flex space-x-2">
              {product.variants
                .map((v) => v.color)
                .filter(
                  (color, index, self) =>
                    self.findIndex((c) => c.id === color.id) === index
                )
                .map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.name}
                    title={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 ${
                      selectedColor?.id === color.id
                        ? "border-gray-900 ring-gray-900"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.variants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("size")}
            </h3>
            <div className="flex space-x-2 flex-wrap">
              {Array.from(
                new Map(
                  product.variants
                    .filter((v) => v.colorId === selectedColor?.id)
                    .map((variant) => [variant.size.id, variant])
                ).values()
              ).map((variant) => (
                <button
                  key={variant.size.id}
                  type="button"
                  onClick={() => setSelectedSize(variant.size)}
                  className={`px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                    selectedSize?.id === variant.size.id
                      ? "border-blue-500 bg-blue-50 text-blue-600 ring-blue-500"
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
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-gray-900 mb-2 block">
              {t("quantity")}
            </label>
            <select
              id="quantity"
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
            {selectedVariant && selectedVariant.stock > 0
              ? t("add_to_cart")
              : t("out_of_stock")}
          </Button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("tags")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
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
