"use client";

import { ACCOUNT_COUNTRIES, zonesForCountry } from "@/lib/account-geo";
import type { CustomerAddress } from "@/lib/customer-account";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AddressForm = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  territoryCode: string;
  zoneCode: string;
  defaultAddress: boolean;
};

const emptyForm: AddressForm = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  zip: "",
  territoryCode: "US",
  zoneCode: "",
  defaultAddress: false,
};

function formFromAddress(address: CustomerAddress): AddressForm {
  return {
    firstName: address.firstName || "",
    lastName: address.lastName || "",
    address1: address.address1 || "",
    address2: address.address2 || "",
    city: address.city || "",
    zip: address.zip || "",
    territoryCode: address.territoryCode || "US",
    zoneCode: address.zoneCode || "",
    defaultAddress: address.isDefault,
  };
}

export function AccountAddressModal({
  open,
  address,
  onClose,
  onSaved,
}: {
  open: boolean;
  address: CustomerAddress | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const zones = useMemo(
    () => zonesForCountry(form.territoryCode),
    [form.territoryCode],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(address ? formFromAddress(address) : emptyForm);
  }, [open, address]);

  function update<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const canSave =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.address1.trim() &&
    form.city.trim() &&
    form.zip.trim() &&
    form.territoryCode &&
    (!zones.length || form.zoneCode);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: address ? "update" : "create",
          addressId: address?.id,
          ...form,
        }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(json.error || "Could not save address");
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="account-modal"
      onClose={onClose}
      onCancel={onClose}
    >
      <form className="account-modal-form" onSubmit={onSubmit}>
        <div className="account-modal-head">
          <h2>{address ? "Edit address" : "Add address"}</h2>
          <button type="button" className="account-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <label className="account-field">
          <span>Country/region</span>
          <select
            value={form.territoryCode}
            onChange={(event) => {
              update("territoryCode", event.target.value);
              update("zoneCode", "");
            }}
          >
            {ACCOUNT_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <div className="account-field-row">
          <label className="account-field">
            <span>First name</span>
            <input
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              autoComplete="given-name"
            />
          </label>
          <label className="account-field">
            <span>Last name</span>
            <input
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              autoComplete="family-name"
            />
          </label>
        </div>

        <label className="account-field">
          <span>Address</span>
          <input
            value={form.address1}
            onChange={(event) => update("address1", event.target.value)}
            autoComplete="address-line1"
          />
        </label>

        <label className="account-field">
          <span>Apartment, suite, etc (optional)</span>
          <input
            value={form.address2}
            onChange={(event) => update("address2", event.target.value)}
            autoComplete="address-line2"
          />
        </label>

        <div className="account-field-row account-field-row-3">
          <label className="account-field">
            <span>City</span>
            <input
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
              autoComplete="address-level2"
            />
          </label>
          {zones.length ? (
            <label className="account-field">
              <span>State</span>
              <select
                value={form.zoneCode}
                onChange={(event) => update("zoneCode", event.target.value)}
              >
                <option value="">State</option>
                {zones.map((zone) => (
                  <option key={zone.code} value={zone.code}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="account-field">
              <span>State</span>
              <input
                value={form.zoneCode}
                onChange={(event) => update("zoneCode", event.target.value)}
                autoComplete="address-level1"
              />
            </label>
          )}
          <label className="account-field">
            <span>ZIP code</span>
            <input
              value={form.zip}
              onChange={(event) => update("zip", event.target.value)}
              autoComplete="postal-code"
            />
          </label>
        </div>

        <label className="account-default">
          <input
            type="checkbox"
            checked={form.defaultAddress}
            onChange={(event) => update("defaultAddress", event.target.checked)}
          />
          <span>This is my default address</span>
        </label>

        {error ? <p className="account-form-error">{error}</p> : null}

        <div className="account-modal-actions">
          <button type="button" className="account-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="account-modal-save" disabled={!canSave || saving}>
            {saving ? "Saving" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
