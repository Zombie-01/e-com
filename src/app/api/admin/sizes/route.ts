import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all sizes
export async function GET() {
  const sizes = await prisma.size.findMany();
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

// DELETE: Delete a size
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.size.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete size" },
      { status: 500 }
    );
  }
}
