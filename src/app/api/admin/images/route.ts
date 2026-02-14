import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session?.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  // For demonstration, just return the image URL
  // In production, handle file uploads and storage
  return NextResponse.json({ url: data.url }, { status: 201 });
}
