import {
  createCustomerAddress,
  deleteCustomerAddress,
  readSessionCookies,
  sessionNeedsRefresh,
  updateCustomerAddress,
  type CustomerAddressInput,
} from "@/lib/customer-account";
import { NextResponse } from "next/server";

function readAddress(body: Record<string, unknown>): CustomerAddressInput | null {
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const address1 = String(body.address1 || "").trim();
  const city = String(body.city || "").trim();
  const zip = String(body.zip || "").trim();
  const territoryCode = String(body.territoryCode || "").trim();
  const zoneCode = String(body.zoneCode || "").trim();
  const address2 = String(body.address2 || "").trim();

  if (!firstName || !lastName || !address1 || !city || !zip || !territoryCode) {
    return null;
  }

  return {
    firstName,
    lastName,
    address1,
    address2: address2 || undefined,
    city,
    zip,
    territoryCode,
    zoneCode: zoneCode || undefined,
  };
}

export async function POST(request: Request) {
  const session = await readSessionCookies();
  if (!session.accessToken || sessionNeedsRefresh(session)) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const action = String(body.action || "create");

  try {
    if (action === "delete") {
      const addressId = String(body.addressId || "");
      if (!addressId) {
        return NextResponse.json({ error: "Address is required." }, { status: 400 });
      }
      await deleteCustomerAddress(addressId);
      return NextResponse.json({ ok: true });
    }

    const address = readAddress(body);
    if (!address) {
      return NextResponse.json(
        { error: "Please complete the required address fields." },
        { status: 400 },
      );
    }

    const defaultAddress = Boolean(body.defaultAddress);

    if (action === "update") {
      const addressId = String(body.addressId || "");
      if (!addressId) {
        return NextResponse.json({ error: "Address is required." }, { status: 400 });
      }
      await updateCustomerAddress(addressId, address, defaultAddress);
      return NextResponse.json({ ok: true });
    }

    await createCustomerAddress(address, defaultAddress);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save address";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
