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

async function sendViaFormSubmit({
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const response = await fetch(
    `https://formsubmit.co/ajax/${CONTACT_TO_EMAIL}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/contact`,
      },
      body: JSON.stringify({
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
      }),
    },
  );

  const json = (await response.json()) as {
    success?: string | boolean;
    message?: string;
  };

  const activated =
    json.success === true ||
    json.success === "true" ||
    /activation/i.test(json.message ?? "");

  if (!activated) {
    console.error("FormSubmit contact failed", json);
  }

  return activated;
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

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      await sendViaResend({ apiKey, email, emailSubject, text, html });
      return NextResponse.json({ ok: true });
    }

    const sent = await sendViaFormSubmit({
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
