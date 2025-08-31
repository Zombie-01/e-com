type SendEmailInput = {
  to: string | string[];
  subject: string;
  from?: string;
  customerName: string;
  orderId: string | number;
  status: string;
  message?: string;
};

export async function sendEmail({
  to,
  subject,
  from,
  customerName,
  orderId,
  status,
  message,
}: SendEmailInput) {
  const apiKey = process.env.ELASTICMAIL_API_KEY;
  const sender = from ?? process.env.SENDER_EMAIL;

  if (!apiKey) throw new Error("ELASTICMAIL_API_KEY is not set");
  if (!sender) throw new Error("SENDER_EMAIL is not set");

  const recipients = Array.isArray(to) ? to : [to];
  // Always add manager's email if not already present
  const allRecipients = Array.from(
    new Set([...recipients, "bo.writech@gmail.com"])
  );

  const htmlContent = `
<div style="
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
">
  <h2 style="
    color: #4CAF50;
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 8px;
  ">
    Захиалгын төлөв шинэчлэгдлээ
  </h2>
  <p style="font-size: 16px;">
    Сайн байна уу, <strong>${customerName}</strong>!
  </p>
  <p style="font-size: 16px;">
    Таны <strong>#${orderId}</strong> захиалга одоо <strong style="color: #4CAF50;">${status}</strong> төлөвт орлоо.
  </p>
  ${
    message
      ? `<p style="font-size: 15px; background-color: #e8f5e9; padding: 10px; border-radius: 5px; color: #2e7d32;">
           Манайхаас илгээсэн мэдээлэл: ${message}
         </p>`
      : ""
  }
  <p style="font-size: 15px; margin-top: 30px;">
    Манай дэлгүүрээс худалдан авалт хийсэнд баярлалаа!
  </p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <small style="font-size: 12px; color: #999;">
    Энэ нь автомат илгээсэн мессеж тул хариу бичих шаардлагагүй.
  </small>
</div>
`;

  const res = await fetch(
    "https://api.elasticemail.com/v4/emails/transactional",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": apiKey,
      },
      body: JSON.stringify({
        Recipients: { To: allRecipients },
        Content: {
          From: sender,
          Subject: subject,
          Body: [
            {
              ContentType: "HTML",
              Content: htmlContent,
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ElasticEmail send failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}
