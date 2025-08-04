import { prisma } from "@/src/lib/prisma";
import { uploadFileToPublicUploads } from "@/src/lib/upload";
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
    const formData = await req.formData();

    const file = formData.get("file") as File;

    const mnTitle = formData.get("mnTitle") as string;
    const enTitle = formData.get("enTitle") as string;
    const url = formData.get("url") as string;
    const active = formData.get("active") === "true";

    if (!file || !mnTitle || !enTitle || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { urlPath } = await uploadFileToPublicUploads(file);
    console.log(urlPath);

    const newBanner = await prisma.banner.create({
      data: {
        image: urlPath as string,
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
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const file = formData.get("file") as File | null;

    const mnTitle = formData.get("mnTitle") as string;
    const enTitle = formData.get("enTitle") as string;
    const url = formData.get("url") as string;
    const active = formData.get("active") === "true";

    if (!id || !mnTitle || !enTitle || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let image: string | undefined;

    if (file && file.name) {
      const upload = await uploadFileToPublicUploads(file);
      image = upload.urlPath;
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        image,
        mnTitle,
        enTitle,
        url,
        active,
      },
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
