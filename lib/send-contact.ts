const CONTACT_TO_EMAIL = "support@greatstonedragon.com";

type ContactMessage = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMessage(payload: ContactMessage) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${CONTACT_TO_EMAIL}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        subject: payload.subject,
        message: payload.message,
        _replyto: payload.email,
        _subject: `[Contact] ${payload.subject}`,
        _template: "table",
        _captcha: "false",
      }),
    },
  );

  const raw = await response.text();
  let json: { success?: string | boolean; message?: string } = {};
  try {
    json = JSON.parse(raw) as { success?: string | boolean; message?: string };
  } catch {
    json = {};
  }

  const sent =
    json.success === true ||
    json.success === "true" ||
    /activation|sent|success/i.test(json.message ?? raw);

  if (!sent) {
    throw new Error("Unable to send your message. Please try again.");
  }
}
