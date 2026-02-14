import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Session } from "next-auth";

// Create user
export async function POST(request: NextRequest) {
  const session = (await getServerSession(
    authOptions,
  )) as any as Session | null;
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password, // Make sure to hash passwords in production!
      role: data.role || "USER",
    },
  });
  return NextResponse.json(user, { status: 201 });
}

// Get all users
export async function GET(request: NextRequest) {
  const session = (await getServerSession(
    authOptions,
  )) as any as Session | null;
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") || "10", 10);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    if (page < 1 || perPage < 1) {
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 },
      );
    }

    // Build search filter if search provided
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      data: users,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Update user
export async function PUT(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  const data = await request.json();
  if (!data.id) {
    return NextResponse.json({ message: "User ID required" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: data.id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });
  return NextResponse.json(user);
}

// Delete user
export async function DELETE(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session?.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "User ID required" }, { status: 400 });
  }
  await prisma.user.delete({
    where: { id: id },
  });
  return NextResponse.json({ message: "User deleted" });
}
