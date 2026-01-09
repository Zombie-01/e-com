import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      companyName,
      companyRegister,
      phoneNumber,
      email,
      amount,
      invoiceNumber,
      items,
      addressId,
    } = await req.json();

    if (!companyName || !companyRegister) {
      return NextResponse.json(
        { message: "Company name and register number are required" },
        { status: 400 }
      );
    }

    // Create unpaid order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        deliveryId: "1", // Default delivery method
        total: amount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
    });

    // Call qPay to create invoice
    const qpayResponse = await fetch("https://api.qpay.mn/v2/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QPAY_API_KEY}`,
      },
      body: JSON.stringify({
        invoice_receiver_code: companyRegister,
        sender_invoice_no: invoiceNumber,
        invoice_description: `Company Invoice - ${companyName}`,
        amount: Math.round(amount),
        sender_branch_code: "1",
        line_items: items.map((item: any) => ({
          code: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          amount: item.price * item.quantity,
        })),
      }),
    });

    if (!qpayResponse.ok) {
      throw new Error("Failed to create qPay invoice");
    }

    const qpayData = await qpayResponse.json();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoice_id: qpayData.invoice_id,
      qr_image: qpayData.qr_image,
      qPay_shortUrl: qpayData.qpay_short_url,
      token: qpayData.token,
    });
  } catch (error) {
    console.error("Company invoice creation error:", error);
    return NextResponse.json(
      { message: "Failed to create company invoice" },
      { status: 500 }
    );
  }
}
