import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_TO_EMAIL = "support@greatstonedragon.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

type ContactPayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
};

function readString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isUsableResendKey(key?: string) {
  return Boolean(key && /^re_[A-Za-z0-9]+/.test(key) && !key.includes("your_resend"));
}

function requestOrigin(request: Request) {
  const headerOrigin = request.headers.get("origin")?.replace(/\/$/, "");
  if (headerOrigin) return headerOrigin;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore */
    }
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.greatstonedragon.com"
  );
}

async function sendViaResend({
  apiKey,
  email,
  emailSubject,
  text,
  html,
}: {
  apiKey: string;
  email: string;
  emailSubject: string;
  text: string;
  html: string;
}) {
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.CONTACT_FROM_EMAIL ??
      "Great Stone Dragon <beth.t@example.com>",
    to: [CONTACT_TO_EMAIL],
    replyTo: email,
    subject: emailSubject,
    text,
    html,
  });

  if (error) {
    throw error;
  }
}

async function readFormSubmitResponse(response: Response) {
  const raw = await response.text();
  try {
    return {
      raw,
      json: JSON.parse(raw) as { success?: string | boolean; message?: string },
    };
  } catch {
    return { raw, json: null };
  }
}

function formSubmitSucceeded(
  response: Response,
  json: { success?: string | boolean; message?: string } | null,
  raw: string,
) {
  if (json) {
    return (
      json.success === true ||
      json.success === "true" ||
      /activation|sent|success/i.test(json.message ?? "")
    );
  }

  return response.ok && /activation|sent|success|thank/i.test(raw);
}

async function sendViaFormSubmit({
  origin,
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  origin: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const payload = {
    name: `${firstName} ${lastName}`,
    email,
    firstName,
    lastName,
    subject,
    message,
    _replyto: email,
    _subject: `[Contact] ${subject}`,
    _template: "table",
    _captcha: "false",
  };

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: origin,
    Referer: `${origin}/contact`,
    "User-Agent":
      "Mozilla/5.0 (compatible; GreatStoneDragonContact/1.0; +https://www.greatstonedragon.com)",
  };

  const response = await fetch(
    `https://formsubmit.co/ajax/${CONTACT_TO_EMAIL}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
  );

  const { json, raw } = await readFormSubmitResponse(response);
  const ok = formSubmitSucceeded(response, json, raw);

  if (!ok) {
    console.error("FormSubmit contact failed", {
      status: response.status,
      json,
      raw: raw.slice(0, 500),
    });
  }

  return ok;
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (readString(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const firstName = readString(body.firstName, MAX_FIELD_LENGTH);
  const lastName = readString(body.lastName, MAX_FIELD_LENGTH);
  const email = readString(body.email, MAX_FIELD_LENGTH);
  const subject = readString(body.subject, MAX_FIELD_LENGTH);
  const message = readString(body.message, MAX_MESSAGE_LENGTH);

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Please fill in all fields." },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const fullName = `${firstName} ${lastName}`;
  const emailSubject = `[Contact] ${subject}`;
  const text = [
    "New contact form message from greatstonedragon.com",
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  const html = `
    <h2>New contact form message</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  const origin = requestOrigin(request);
  const apiKey = process.env.RESEND_API_KEY;

  if (isUsableResendKey(apiKey)) {
    try {
      await sendViaResend({
        apiKey: apiKey as string,
        email,
        emailSubject,
        text,
        html,
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Resend contact failed, trying FormSubmit", error);
    }
  }

  try {
    const sent = await sendViaFormSubmit({
      origin,
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Unable to send your message. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact email failed", error);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 502 },
    );
  }
}
