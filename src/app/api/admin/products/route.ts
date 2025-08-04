import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { uploadFileToPublicUploads } from "@/src/lib/upload";

// GET all products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Basic fields
    const mnName = formData.get("mnName") as string;
    const enName = formData.get("enName") as string;
    const mnDesc = formData.get("mnDesc") as string;
    const enDesc = formData.get("enDesc") as string;
    const price = parseFloat(formData.get("price") as string);
    const sku = formData.get("sku") as string;
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;

    // Tags JSON string => parse
    const tagIdsStr = formData.get("tagIds") as string;
    const tagIds = tagIdsStr ? JSON.parse(tagIdsStr) : [];

    // Variants JSON string (array of variant objects)
    // Example variant: { colorId: "colorId1", sizeId: "sizeId1", imageFileName: "file1.jpg", stock: 5 }
    // But for images in variants, usually you upload separately; here simplified as a JSON string with no files.
    const variantsStr = formData.get("variants") as string;
    const variantsData = variantsStr ? JSON.parse(variantsStr) : [];

    // Collect all variant images files by naming convention: variantImage_0, variantImage_1, ...
    const variantImagesMap: Record<string, File> = {};
    for (const key of formData.keys() as any) {
      if (key.startsWith("variantImage_")) {
        const file = formData.get(key) as File;
        if (file && file.name) {
          variantImagesMap[key] = file;
        }
      }
    }

    // Now upload each variant image and assign url to variant
    for (let i = 0; i < variantsData.length; i++) {
      const variant = variantsData[i];
      const fileKey = `variantImage_${i}`;
      if (variantImagesMap[fileKey]) {
        const uploadResult = await uploadFileToPublicUploads(
          variantImagesMap[fileKey]
        );
        variant.image = uploadResult.urlPath; // assign uploaded url to variant.image
      } else {
        // No new image uploaded, keep existing or empty string
        variant.image = variant.image || "";
      }
    }

    // Then prepare variantsCreate with updated image URLs:
    const variantsCreate = variantsData.map((v: any) => ({
      colorId: v.colorId,
      sizeId: v.sizeId || null,
      image: v.image,
      stock: v.stock,
    }));

    const product = await prisma.product.create({
      data: {
        mnName,
        enName,
        mnDesc,
        enDesc,
        price,
        sku,
        brandId,
        categoryId,
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
        variants: {
          create: variantsCreate,
        },
      },
      include: {
        brand: true,
        category: true,
        tags: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Basic fields
    const mnName = formData.get("mnName") as string;
    const enName = formData.get("enName") as string;
    const mnDesc = formData.get("mnDesc") as string;
    const enDesc = formData.get("enDesc") as string;
    const price = parseFloat(formData.get("price") as string);
    if (isNaN(price)) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    }
    const sku = formData.get("sku") as string;
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;

    // Parse tags and variants JSON strings
    const tagIdsStr = formData.get("tagIds") as string;
    const tagIds = tagIdsStr ? JSON.parse(tagIdsStr) : [];

    const variantsStr = formData.get("variants") as string;
    const variantsData = variantsStr ? JSON.parse(variantsStr) : [];

    // Collect variant images files
    const variantImagesMap: Record<string, File> = {};
    for (const key of formData.keys() as any) {
      if (key.startsWith("variantImage_")) {
        const file = formData.get(key) as File;
        if (file && file.name) {
          variantImagesMap[key] = file;
        }
      }
    }

    // Upload variant images and update variant image URLs
    for (let i = 0; i < variantsData.length; i++) {
      const variant = variantsData[i];
      const fileKey = `variantImage_${i}`;
      if (variantImagesMap[fileKey]) {
        const uploadResult = await uploadFileToPublicUploads(
          variantImagesMap[fileKey]
        );
        variant.image = uploadResult.urlPath;
      } else {
        variant.image = variant.image || "";
      }
    }

    // Delete existing variants and create new ones to simplify update (alternative: implement upsert or update/delete logic)
    // Also, delete existing tags and connect new tags

    // Update product with new fields, tags, and variants
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        mnName,
        enName,
        mnDesc,
        enDesc,
        price,
        sku,
        brandId,
        categoryId,
        tags: {
          set: [], // Clear existing tags
          connect: tagIds.map((tagId: string) => ({ id: tagId })),
        },
        variants: {
          deleteMany: {}, // Remove existing variants first
          create: variantsData.map((v: any) => ({
            colorId: v.colorId,
            sizeId: v.sizeId || null,
            image: v.image,
            stock: v.stock,
          })),
        },
      },
      include: {
        brand: true,
        category: true,
        tags: true,
        variants: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a product (expects ?id=productId in query)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
