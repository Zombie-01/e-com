import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            color: true,
            size: true
          }
        },
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create a product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        mnName: data.mnName,
        enName: data.enName,
        mnDesc: data.mnDesc,
        enDesc: data.enDesc,
        price: data.price,
        sku: data.sku,
        brandId: data.brandId,
        categoryId: data.categoryId,
        images: data.images,
        tags: {
          connect: data.tagIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        brand: true,
        category: true,
        tags: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update a product (expects ?id=productId in query)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        mnName: data.mnName,
        enName: data.enName,
        mnDesc: data.mnDesc,
        enDesc: data.enDesc,
        price: data.price,
        sku: data.sku,
        brandId: data.brandId,
        categoryId: data.categoryId,
        images: data.images,
        tags: {
          set: [],
          connect: data.tagIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        brand: true,
        category: true,
        tags: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a product (expects ?id=productId in query)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
