import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// 🔐 Middleware to validate admin
async function requireAdmin(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session?.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return session;
}
// CREATE brand
export async function POST(request: NextRequest) {
  const result = await requireAdmin(request);
  if (result instanceof NextResponse) return result; // unauthorized response

  const data = await request.json();
  const brand = await prisma.brand.create({
    data: {
      mnName: data.mnName,
      enName: data.enName,
    },
  });

  return NextResponse.json(brand, { status: 201 });
}

// READ all brands
export async function GET() {
  const brands = await prisma.brand.findMany({ where: { active: true } });
  return NextResponse.json(brands);
}

// UPDATE brand
export async function PUT(request: NextRequest) {
  const result = await requireAdmin(request);
  if (result instanceof NextResponse) return result;

  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ message: "Missing brand ID" }, { status: 400 });
  }

  try {
    const updated = await prisma.brand.update({
      where: { id: data.id },
      data: {
        mnName: data.mnName,
        enName: data.enName,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update brand", error },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Missing brand ID" },
        { status: 400 },
      );
    }

    // Check if any active products exist for this brand
    const activeProductsCount = await prisma.product.count({
      where: {
        brandId: id,
        active: true,
      },
    });

    if (activeProductsCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot deactivate brand: there are active products under this brand.",
        },
        { status: 400 },
      );
    }

    // No active products, safe to deactivate brand
    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(updatedBrand);
  } catch (error: any) {
    console.error("DELETE brand error:", error);

    if (error.code === "P2025") {
      // Prisma error: Record not found
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    if (error.code === "P2003") {
      // Foreign key constraint failed
      return NextResponse.json(
        { message: "Cannot delete brand: it is referenced by other data." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
