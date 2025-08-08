import { NextRequest } from "next/server";

// Step 1: Get QPay Access Token
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
    throw new Error("Failed to get QPay token");
  }

  const data = await response.json();
  return data.access_token;
}

// Step 2: Create Invoice
async function createInvoice(
  token: string,
  invoiceReceiverCode: string,
  invoiceNumber: string,
  amount: string | number,
  items: any
) {
  console.log(
    JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: invoiceNumber,
      invoice_receiver_code: invoiceReceiverCode,
      invoice_description: "Payment invoice",
      amount,
      callback_url: process.env.APP_BASE_URL + "/api/qpay/callback",
      extra_data: { items },
    })
  );
  const response = await fetch("https://merchant.qpay.mn/v2/invoice", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: invoiceNumber,
      invoice_receiver_code: invoiceReceiverCode,
      invoice_description: "Payment invoice",
      amount,
      callback_url: process.env.NEXTAUTH_URL + "/api/qpay/callback",
      extra_data: { items },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create invoice");
  }

  const data = await response.json();
  return data;
}

// Main API Handler — should be POST
export async function POST(req: NextRequest) {
  try {
    const { invoiceReceiverCode, amount, invoiceNumber, items } =
      await req.json();

    const token = await getQpayAccessToken();

    const invoice = await createInvoice(
      token,
      invoiceReceiverCode,
      invoiceNumber,
      amount,
      items
    );

    console.log(invoice);

    return Response.json({
      success: true,
      ...invoice,
      token,
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
