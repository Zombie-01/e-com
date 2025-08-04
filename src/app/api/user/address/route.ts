import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// GET all addresses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(addresses);
}

// POST new address
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const newAddress = await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName: data.fullName,
      phone: data.phone,
    },
  });

  return NextResponse.json(newAddress);
}
