import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const body = await request.json();

    const { deliveryId, items } = body;

    if (!deliveryId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Invalid order data: deliveryId and items are required." },
        { status: 400 }
      );
    }

    // Validate items & calculate total
    let total = 0;

    for (const item of items) {
      if (
        !item.productVariantId ||
        typeof item.quantity !== "number" ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid order items: productVariantId and positive quantity required.",
          },
          { status: 400 }
        );
      }

      // Fetch product variant with product (to get price)
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: true },
      });

      if (!variant) {
        return NextResponse.json(
          { message: `Product variant not found: ${item.productVariantId}` },
          { status: 400 }
        );
      }

      // Use product.price for price calculation
      const price = variant.product.price;
      total += price * item.quantity;
    }

    // Create order + order items transactionally
    const createdOrder = await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          userId,
          deliveryId,
          total,
          status: "PENDING",
        },
      });

      for (const item of items) {
        // Get price again per item for unitPrice field
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: variant!.product.price,
          },
        });
      }

      return order;
    });

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
