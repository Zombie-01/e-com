"use client";

import Image from "next/image";
import { useCartStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
interface Color {
  id: string;
  name: string;
  hex: string;
}

interface Size {
  id: string;
  name: string;
}

interface CartItemProps {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: Color;
  size?: Size;
}

export default function CartItem({ item }: { item: CartItemProps }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">
              Color:{" "}
              <span
                className={`w-8 h-8 rounded-full border-2 q`}
                style={{ backgroundColor: item.color.hex }}></span>
              {item.size && ` • Size: ${item.size}`}
            </p>
            <p className="font-semibold text-blue-600 mt-1">
              ${item.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateQuantity(item.variantId, Math.max(1, item.quantity - 1))
              }>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.variantId)}
              className="text-red-500 hover:text-red-700 mt-1">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
