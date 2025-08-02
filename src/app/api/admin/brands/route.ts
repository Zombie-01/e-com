import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

// 🔐 Middleware to validate admin
async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

// CREATE brand
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return;

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
  const brands = await prisma.brand.findMany();
  return NextResponse.json(brands);
}

// UPDATE brand
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return;

  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ message: 'Missing brand ID' }, { status: 400 });
  }

  const updated = await prisma.brand.update({
    where: { id: data.id },
    data: {
      mnName: data.mnName,
      enName: data.enName,
    },
  });

  return NextResponse.json(updated);
}

// DELETE brand
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return;

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ message: 'Missing brand ID' }, { status: 400 });
  }

  const deleted = await prisma.brand.delete({
    where: { id },
  });

  return NextResponse.json(deleted);
}
