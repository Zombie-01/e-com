import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session?.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const category = await prisma.category.create({
    data: {
      mnName: data.mnName,
      enName: data.enName,
      parentId: data.parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
  });
  return NextResponse.json(categories);
}

export async function PUT(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session?.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const category = await prisma.category.update({
    where: { id: data.id },
    data: {
      mnName: data.mnName,
      enName: data.enName,
      parentId: data.parentId || null,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || session?.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { message: "Missing category ID" },
        { status: 400 },
      );
    }

    // Check for active products with this category
    const activeProductsCount = await prisma.product.count({
      where: {
        categoryId: id,
        active: true,
      },
    });

    if (activeProductsCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete category: there are active products in this category.",
        },
        { status: 400 },
      );
    }

    // Soft delete: set active = false
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error("Delete category error:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { message: "Cannot delete category: it is used by other records." },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
