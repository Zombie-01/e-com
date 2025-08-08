type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: SendEmailInput) {
  const apiKey = process.env.ELASTICMAIL_API_KEY;
  const sender = from ?? process.env.SENDER_EMAIL;

  if (!apiKey) throw new Error("ELASTICMAIL_API_KEY is not set");
  if (!sender) throw new Error("SENDER_EMAIL is not set");

  const recipients = Array.isArray(to) ? to : [to];

  const res = await fetch(
    "https://api.elasticemail.com/v4/emails/transactional",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": apiKey,
      },
      body: JSON.stringify({
        Recipients: { To: recipients },
        Content: {
          From: sender,
          Subject: subject,
          Body: [{ ContentType: "HTML", Content: html }],
        },
      }),
      // Next.js edge/runtime-д fetch глобал байдаг
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ElasticEmail send failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}
