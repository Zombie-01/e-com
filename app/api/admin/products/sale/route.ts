import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function PUT(req: Request) {
  try {
    const { id, salePercent } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { salePercent },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error applying sale:", error);
    return NextResponse.json({ error: "Error applying sale" }, { status: 500 });
  }
}
