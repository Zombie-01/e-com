import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const body = await request.json();
    const { deliveryId, items } = body;

    // ✅ Basic validation
    if (!deliveryId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          message:
            "Invalid data: 'deliveryId' and at least one 'item' are required.",
        },
        { status: 400 }
      );
    }

    // ✅ Fetch all variants in one query
    const variantIds = items.map((item) => item.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      const foundIds = new Set(variants.map((v) => v.id));
      const missing = variantIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        {
          message: `Missing or invalid product variants: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ Calculate total
    let total = 0;
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    for (const item of items) {
      const variant = variantMap.get(item.productVariantId);
      if (!variant || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { message: `Invalid quantity or variant: ${item.productVariantId}` },
          { status: 400 }
        );
      }
      total += variant.product.price * item.quantity;
    }

    // ✅ Transactional creation of order + items
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          deliveryId,
          total,
          status: "PENDING",
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => {
          const variant = variantMap.get(item.productVariantId)!;
          return {
            orderId: order.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: variant.product.price,
          };
        }),
      });

      return order;
    });

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
