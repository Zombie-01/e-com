import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// CREATE a new tag
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const tag = await prisma.tag.create({
    data: {
      mnName: data.mnName,
      enName: data.enName,
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function GET(request: NextRequest) {
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

    const total = await prisma.tag.count();

    const tags = await prisma.tag.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return NextResponse.json({
      data: tags,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE a tag (expects ?id= tagId)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  console.log(data);

  if (!data.id) {
    return NextResponse.json(
      { message: "Tag ID is required" },
      { status: 400 }
    );
  }

  const updated = await prisma.tag.update({
    where: { id: data.id },
    data: {
      mnName: data.mnName,
      enName: data.enName,
    },
  });

  return NextResponse.json(updated);
}

// DELETE a tag (expects ?id= tagId)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Tag ID is required" },
      { status: 400 }
    );
  }

  await prisma.tag.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Tag deleted successfully" });
}
