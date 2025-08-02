import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: fetch all banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany();
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST: create a new banner
export async function POST(req: NextRequest) {
  try {
    const { image, mnTitle, enTitle, url, active } = await req.json();

    if (!image || !mnTitle || !enTitle || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newBanner = await prisma.banner.create({
      data: {
        image,
        mnTitle,
        enTitle,
        url,
        active: active ?? true,
      },
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}

// PUT: update existing banner
export async function PUT(req: NextRequest) {
  try {
    const { id, image, mnTitle, enTitle, url, active } = await req.json();

    if (!id || !image || !mnTitle || !enTitle || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: { image, mnTitle, enTitle, url, active },
    });

    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE: delete a banner
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing banner id" }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
