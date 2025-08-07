import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all sizes
export async function GET() {
  const sizes = await prisma.size.findMany({ where: { active: true } });
  return NextResponse.json(sizes);
}

// POST: Create a new size
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing name or value" },
        { status: 400 }
      );
    }

    const newSize = await prisma.size.create({
      data: { name },
    });

    return NextResponse.json(newSize, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create size" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing size
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedSize = await prisma.size.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedSize);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update size" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sizeId = req.nextUrl.searchParams.get("id");

    if (!sizeId) {
      return NextResponse.json({ error: "Missing size ID" }, { status: 400 });
    }

    // Check if any active product variant uses this size
    const activeVariantUsingSize = await prisma.productVariant.findFirst({
      where: {
        sizeId,
        active: true,
      },
    });

    if (activeVariantUsingSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot deactivate size because there are active product variants using it.",
        },
        { status: 400 }
      );
    }

    // Check if any (active or inactive) variant uses this size
    const variantUsingSize = await prisma.productVariant.findFirst({
      where: { sizeId },
    });

    if (variantUsingSize) {
      // Soft delete: set size active to false
      await prisma.size.update({
        where: { id: sizeId },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        message: "Size is in use and was deactivated instead of being deleted.",
      });
    }

    // No variants use this size: safe to hard delete
    await prisma.size.delete({
      where: { id: sizeId },
    });

    return NextResponse.json({ success: true, message: "Size deleted." });
  } catch (error: any) {
    console.error("DELETE size error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete or deactivate size" },
      { status: 500 }
    );
  }
}
