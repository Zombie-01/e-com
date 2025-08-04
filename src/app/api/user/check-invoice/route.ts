// app/api/check-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

async function getQpayAccessToken() {
  const username = process.env.QPAY_USERNAME || "MERCHANT999";
  const password = process.env.QPAY_PASSWORD || "your_password_here";

  const credentials = `${username}:${password}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  const response = await fetch("https://merchant.qpay.mn/v2/auth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Token авахад алдаа гарлаа.");
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoice_id = searchParams.get("invoice_id");

  if (!invoice_id) {
    return NextResponse.json({ error: "invoice_id параметр дутуу байна" }, { status: 400 });
  }

  const token = await getQpayAccessToken();
  if (!token) {
    return NextResponse.json({ error: "QPay токен авахад алдаа гарлаа" }, { status: 500 });
  }

  const qpayRes = await fetch(`https://merchant.qpay.mn/v2/invoice/${invoice_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!qpayRes.ok) {
    return NextResponse.json({ error: "Нэхэмжлэлийн төлөв шалгах үед алдаа гарлаа" }, { status: 500 });
  }

  const data = await qpayRes.json();

  console.log(data)

  return NextResponse.json({ status: data.invoice_status }); // e.g., "PAID"
}
