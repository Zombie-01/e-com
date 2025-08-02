import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
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
  const categories = await prisma.category.findMany();
  return NextResponse.json(categories);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
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
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Category deleted" });
}
