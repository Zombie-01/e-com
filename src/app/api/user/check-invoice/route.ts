// app/api/check-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoice_id = searchParams.get("invoice_id");
  const token = searchParams.get("token");

  if (!invoice_id) {
    return NextResponse.json(
      { error: "invoice_id параметр дутуу байна" },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "QPay токен авахад алдаа гарлаа" },
      { status: 500 }
    );
  }

  const qpayRes = await fetch(
    `https://merchant.qpay.mn/v2/invoice/${invoice_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!qpayRes.ok) {
    return NextResponse.json(
      { error: "Нэхэмжлэлийн төлөв шалгах үед алдаа гарлаа" },
      { status: 500 }
    );
  }

  const data = await qpayRes.json();

  console.log(data);

  return NextResponse.json({ status: data.invoice_status }); // e.g., "PAID"
}
