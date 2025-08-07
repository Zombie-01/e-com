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
      where: { active: true },
      include: {
        brand: true,
        category: true,
        variants: {
          where: { active: true },
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

    console.log(formData);

    // Basic fields
    const mnName = formData.get("mnName") as string;
    const enName = formData.get("enName") as string;
    const mnDesc = formData.get("mnDesc") as string;
    const enDesc = formData.get("enDesc") as string;
    const price = parseFloat(formData.get("price") as string);
    const costPrice = parseFloat(formData.get("costPrice") as string); // Added costPrice
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
    const variantsData: any[] = variantsStr ? JSON.parse(variantsStr) : [];

    // Collect variant image files for each variant (multiple images per variant)
    const variantImageUploads: Promise<string[]>[] = [];
    for (let i = 0; i < variantsData.length; i++) {
      const files: File[] = [];
      let imgIdx = 0;
      while (true) {
        const fileKey = `variantImage_${i}_${imgIdx}`;
        const file = formData.get(fileKey) as File;
        if (file && file.name) {
          files.push(file);
        } else {
          break;
        }
        imgIdx++;
      }
      if (files.length > 0) {
        variantImageUploads.push(
          Promise.all(
            files.map((f) =>
              uploadFileToPublicUploads(f).then((res) => res.urlPath as string)
            )
          )
        );
      } else {
        variantImageUploads.push(Promise.resolve([]));
      }
    }

    // Await all uploads
    const uploadedImageUrlsArr = await Promise.all(variantImageUploads);

    // Assign uploaded image URLs array back to variants
    const variantsCreate = variantsData.map((v, i) => ({
      colorId: v.colorId,
      sizeId: v.sizeId || null,
      image: uploadedImageUrlsArr[i], // array of image URLs
      stock: v.stock,
    }));

    const product = await prisma.product.create({
      data: {
        mnName,
        enName,
        mnDesc,
        enDesc,
        price,
        costPrice, // Added costPrice
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
    const costPrice = parseFloat(formData.get("costPrice") as string); // Added costPrice
    const sku = formData.get("sku") as string;
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;

    // Parse tags and variants JSON strings
    const tagIdsStr = formData.get("tagIds") as string;
    const tagIds = tagIdsStr ? JSON.parse(tagIdsStr) : [];

    const variantsStr = formData.get("variants") as string;
    const variantsData = variantsStr ? JSON.parse(variantsStr) : [];

    // Collect variant images files (multiple per variant)
    const variantImagesMap: Record<string, File> = {};
    for (const key of formData.keys() as any) {
      if (key.startsWith("variantImage_")) {
        const file = formData.get(key) as File;
        if (file && file.name) {
          variantImagesMap[key] = file;
        }
      }
    }

    // For each variant, collect all images
    const variantsUpdate = [];
    for (let i = 0; i < variantsData.length; i++) {
      const images: string[] = [];
      let imgIdx = 0;
      while (true) {
        const fileKey = `variantImage_${i}_${imgIdx}`;
        if (variantImagesMap[fileKey]) {
          const uploadResult = await uploadFileToPublicUploads(
            variantImagesMap[fileKey]
          );
          images.push(uploadResult.urlPath as string);
        } else {
          break;
        }
        imgIdx++;
      }
      // If no new images, fallback to existing image array or empty
      const existingImages = Array.isArray(variantsData[i].image)
        ? variantsData[i].image
        : [];
      variantsUpdate.push({
        colorId: variantsData[i].colorId,
        sizeId: variantsData[i].sizeId || null,
        image: images.length > 0 ? images : existingImages,
        stock: variantsData[i].stock,
      });
    }

    // Update product with new fields, tags, and variants
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        mnName,
        enName,
        mnDesc,
        enDesc,
        price,
        costPrice, // Added costPrice
        sku,
        brandId,
        categoryId,
        tags: {
          set: [],
          connect: tagIds.map((tagId: string) => ({ id: tagId })),
        },
        variants: {
          deleteMany: {},
          create: variantsUpdate,
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Soft delete product variants
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { active: false },
    });

    // Soft delete product
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Product and variants deactivated" });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
