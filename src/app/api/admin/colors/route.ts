import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Get all colors
export async function GET() {
  const colors = await prisma.color.findMany({ where: { active: true } });
  return NextResponse.json(colors);
}

// POST: Create new color
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, hex } = body;

    if (!name || !hex) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newColor = await prisma.color.create({
      data: { name, hex },
    });

    return NextResponse.json(newColor, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create color" },
      { status: 500 }
    );
  }
}

// PUT: Update existing color
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, hex } = body;

    if (!id || !name || !hex) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedColor = await prisma.color.update({
      where: { id },
      data: { name, hex },
    });

    return NextResponse.json(updatedColor);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update color" },
      { status: 500 }
    );
  }
}

// DELETE: Soft-delete or hard-delete color
export async function DELETE(req: NextRequest) {
  try {
    const colorId = req.nextUrl.searchParams.get("id");

    if (!colorId) {
      return NextResponse.json({ error: "Missing color ID" }, { status: 400 });
    }

    // Check if any active product variant uses this color
    const activeVariantsUsingColor = await prisma.productVariant.findFirst({
      where: {
        colorId,
        active: true,
      },
    });

    if (activeVariantsUsingColor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot deactivate color because there are active product variants using it.",
        },
        { status: 400 }
      );
    }

    // Check if any (active or inactive) variants use this color
    const variantsUsingColor = await prisma.productVariant.findFirst({
      where: {
        colorId,
      },
    });

    if (variantsUsingColor) {
      // Soft delete: set color active to false
      await prisma.color.update({
        where: { id: colorId },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        message:
          "Color is in use and was deactivated instead of being deleted.",
      });
    }

    // No variants use this color: safe to hard delete
    await prisma.color.delete({
      where: { id: colorId },
    });

    return NextResponse.json({ success: true, message: "Color deleted." });
  } catch (error: any) {
    console.error("DELETE color error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete or deactivate color" },
      { status: 500 }
    );
  }
}
