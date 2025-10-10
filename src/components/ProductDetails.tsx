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
  image?: string[];
  stock: number;
  active: boolean;
  color?: Color;
  size?: Size;
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
  costPrice: number;
  sku: string;
  brandId: string;
  categoryId: string;
  brand: Brand;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  salePercent?: number; // 👈 add this
}

interface ProductDetailsProps {
  product: Product;
  locale: "mn" | "en";
}

export default function ProductDetails({ product, locale }: ProductDetailsProps) {
  const t = useTranslations("products");
  const { addItem } = useCartStore();

  const findVariant = (colorId?: string, sizeId?: string) =>
    product.variants.find(
      (v) =>
        v.colorId === colorId &&
        v.sizeId === sizeId &&
        v.active &&
        v.color != null &&
        v.size != null
    );

  const allImages = product.variants.flatMap((v) => v.image || []);
  const initialColor = product.variants[0]?.color ?? undefined;
  const initialSize = product.variants[0]?.size ?? undefined;
  const initialVariant =
    findVariant(initialColor?.id, initialSize?.id) || product?.variants[0];

  const [selectedColor, setSelectedColor] = useState<Color | undefined>(initialColor);
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(initialSize);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(initialVariant);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    initialVariant?.image?.[0] || allImages[0]
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!selectedColor || !selectedSize) {
      setSelectedVariant(product?.variants[0]);
      return;
    }
    const variant = findVariant(selectedColor.id, selectedSize.id);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    } else {
      setSelectedVariant(product?.variants[0]);
    }
  }, [selectedColor, selectedSize, product.variants]);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < quantity) {
      console.error("Cannot add to cart: variant not selected or insufficient stock.");
      return;
    }

    const hasSale = !!product.salePercent && product.salePercent > 0;
    const finalPrice = hasSale
      ? Math.round(product.price * (1 - product.salePercent! / 100))
      : product.price;

    addItem({
      id: product.id,
      productId: product.id,
      variantId: selectedVariant.id,
      name: locale === "mn" ? product.mnName : product.enName,
      price: finalPrice, // 👈 use sale price in cart
      quantity,
      image: selectedVariant.image?.[0] || "",
      color: selectedVariant?.color,
      size: selectedVariant?.size,
      costPrice: product?.costPrice,
    });
  };

  // ✅ Calculate sale price
  const hasSale = !!product.salePercent && product.salePercent > 0;
  const salePrice = hasSale
    ? Math.round(product.price * (1 - product.salePercent! / 100))
    : product.price;

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

          {/* Sale Badge */}
          {hasSale && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1">
              -{product.salePercent}%
            </Badge>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === img
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${locale === "mn" ? product.mnName : product.enName} ${idx + 1}`}
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

          {/* Price with sale logic */}
          <div className="flex items-baseline gap-3">
            <p
              className={`text-2xl font-bold ${
                hasSale ? "text-red-600" : "text-blue-600"
              }`}
            >
              ₮{salePrice.toLocaleString()}
            </p>
            {hasSale && (
              <p className="text-gray-400 line-through text-lg">
                ₮{product.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-700 leading-relaxed">
            {locale === "mn" ? product.mnDesc : product.enDesc}
          </p>
        </div>

        {/* Color selector */}
        {product.variants.some((v) => v.color != null) && (
          <div>
            <h3>Color</h3>
            <div className="flex space-x-2">
              {Array.from(
                new Map(
                  product.variants
                    .filter((v) => v.color != null)
                    .map((v) => [v.color!.id, v.color!])
                )
              )
                .map(([, color]) => color)
                .map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.name}
                    title={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor?.id === color.id
                        ? "border-gray-900 ring-gray-900"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color?.hex }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {selectedColor &&
          product.variants.some(
            (v) => v.colorId === selectedColor.id && v.size != null
          ) && (
            <div>
              <h3>Size</h3>
              <div className="flex space-x-2 flex-wrap">
                {Array.from(
                  new Map(
                    product.variants
                      .filter(
                        (v) => v.colorId === selectedColor.id && v.size != null
                      )
                      .map((v) => [v.size!.id, v])
                  ).values()
                ).map((variant) => (
                  <button
                    key={variant.size!.id}
                    type="button"
                    onClick={() => setSelectedSize(variant.size!)}
                    className={`px-4 py-2 text-sm border rounded-md ${
                      selectedSize?.id === variant.size!.id
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {variant.size!.name}
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
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              {t("quantity")}
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {[...Array(Math.min(selectedVariant?.stock || 0, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock < quantity}
            size="lg"
            className="w-full"
          >
            {selectedVariant && selectedVariant.stock > 0
              ? t("add_to_cart")
              : t("out_of_stock")}
          </Button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">{t("tags")}</h3>
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
