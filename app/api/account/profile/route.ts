import {
  readSessionCookies,
  sessionNeedsRefresh,
  updateCustomerProfile,
} from "@/lib/customer-account";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await readSessionCookies();
  if (!session.accessToken || sessionNeedsRefresh(session)) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body: { firstName?: string; lastName?: string };
  try {
    body = (await request.json()) as { firstName?: string; lastName?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const firstName = body.firstName?.trim() || "";
  const lastName = body.lastName?.trim() || "";
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "First name and last name are required." },
      { status: 400 },
    );
  }

  try {
    await updateCustomerProfile({ firstName, lastName });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
