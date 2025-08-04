import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") || "10", 10);

    if (page < 1 || perPage < 1) {
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const total = await prisma.order.count();

    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, addresses: true },
        },
        delivery: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: true, // Optional: include related product details
              },
            },
          },
        },
        transaction: true,
      },
    });

    return NextResponse.json({
      data: orders,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
