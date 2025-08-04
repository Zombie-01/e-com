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
    const tags = await prisma.tag.findMany({});
    return NextResponse.json(tags);
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
