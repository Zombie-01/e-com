import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// UPDATE address
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const data = await req.json();

  const updated = await prisma.address.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
    },
  });

  return NextResponse.json(updated);
}

// DELETE address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  await prisma.address.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
