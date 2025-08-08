import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { sendEmail } from "@/src/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let to: string | undefined;
  try {
    const body = await req.json();
    to = body?.to;
  } catch {
    // optional
  }
  const recipient = to ?? session.user.email;

  await sendEmail({
    to: recipient!,
    subject: "Orchid.mn – Test email",
    html: "<h1>Test</h1><p>This is a test email from admin panel.</p>",
  });

  return NextResponse.json({ ok: true });
}
