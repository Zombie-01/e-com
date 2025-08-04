import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Send request to QPay
    const qpayResponse = await fetch("https://qpay.orchid.mn/api/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "234567",
        Authorization: `Basic ${Buffer.from("ORCHID:9zhYtl8y").toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(body),
    });

    const qpayData = await qpayResponse.json();

    if (!qpayResponse.ok) {
      return NextResponse.json(
        { error: qpayData.message || "QPay request failed" },
        { status: qpayResponse.status }
      );
    }

    // 3. Return both QPay response and local transaction ID
    return NextResponse.json({
      ...qpayData,
    });
  } catch (error: any) {
    console.error("Error in QPay proxy + DB transaction:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
