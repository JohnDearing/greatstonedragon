import { sendContactMessage } from "@/lib/send-contact";
import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function readString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  let body: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
    website?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
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

  try {
    await sendContactMessage({ firstName, lastName, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact email failed", error);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 502 },
    );
  }
}
