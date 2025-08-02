import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Get all colors
export async function GET() {
  const colors = await prisma.color.findMany();
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

// DELETE: Delete color
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    let asd = await prisma.color.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete color" },
      { status: 500 }
    );
  }
}
