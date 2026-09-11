"use client";

import { AccountAddressModal } from "@/components/account-address-modal";
import type { CustomerAddress, CustomerProfile } from "@/lib/customer-account";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountProfileView({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();
  const nameDialogRef = useRef<HTMLDialogElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const dialog = nameDialogRef.current;
    if (!dialog) return;
    if (editingName && !dialog.open) dialog.showModal();
    if (!editingName && dialog.open) dialog.close();
  }, [editingName]);

  useEffect(() => {
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
  }, [profile.firstName, profile.lastName]);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    if (savingName) return;
    setSavingName(true);
    setNameError("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(json.error || "Could not update name");
      setEditingName(false);
      router.refresh();
    } catch (caught) {
      setNameError(caught instanceof Error ? caught.message : "Could not update name");
    } finally {
      setSavingName(false);
    }
  }

  async function removeAddress(addressId: string) {
    if (!window.confirm("Remove this address?")) return;
    setBusyId(addressId);
    try {
      const response = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", addressId }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(json.error || "Could not remove address");
      router.refresh();
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "Could not remove address");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="account-profile">
      <div className="account-profile-row">
        <h1>{profile.displayName}</h1>
        <button
          type="button"
          className="account-pill-btn"
          onClick={() => {
            setNameError("");
            setEditingName(true);
          }}
        >
          Edit
        </button>
      </div>

      <div className="account-email-pill">
        <span>Email</span>
        <strong>{profile.email || "No email on file"}</strong>
      </div>

      <div className="account-profile-row">
        <h2>Addresses</h2>
        <button
          type="button"
          className="account-pill-btn"
          onClick={() => {
            setEditingAddress(null);
            setAddressOpen(true);
          }}
        >
          Add
        </button>
      </div>

      {profile.addresses.length ? (
        <ul className="account-address-cards">
          {profile.addresses.map((address) => (
            <li key={address.id} className="account-address-card">
              <div>
                {address.isDefault ? (
                  <p className="account-address-default">Default</p>
                ) : null}
                {(address.formatted.length
                  ? address.formatted
                  : [address.address1, [address.city, address.province, address.zip].filter(Boolean).join(", "), address.country]
                )
                  .filter(Boolean)
                  .map((line) => (
                    <p key={String(line)}>{line}</p>
                  ))}
              </div>
              <div className="account-address-actions">
                <button
                  type="button"
                  className="account-text-btn"
                  onClick={() => {
                    setEditingAddress(address);
                    setAddressOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="account-text-btn"
                  disabled={busyId === address.id}
                  onClick={() => removeAddress(address.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="account-address-empty">
          <span className="account-pin-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.5c-3.4 0-6.2 2.7-6.2 6.1 0 4.3 6.2 10.9 6.2 10.9s6.2-6.6 6.2-10.9c0-3.4-2.8-6.1-6.2-6.1zm0 8.2a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2z" />
            </svg>
          </span>
          <p>No addresses added</p>
        </div>
      )}

      <div className="account-signout-row">
        <a href="/api/auth/logout" className="account-pill-btn">
          Sign out
        </a>
        <a href="/api/auth/logout" className="account-signout-all">
          Sign out of all devices
        </a>
      </div>

      <dialog
        ref={nameDialogRef}
        className="account-modal"
        onClose={() => setEditingName(false)}
        onCancel={() => setEditingName(false)}
      >
        <form className="account-modal-form" onSubmit={saveName}>
          <div className="account-modal-head">
            <h2>Edit profile</h2>
            <button
              type="button"
              className="account-modal-close"
              onClick={() => setEditingName(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="account-field-row">
            <label className="account-field">
              <span>First name</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="account-field">
              <span>Last name</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
          </div>
          {nameError ? <p className="account-form-error">{nameError}</p> : null}
          <div className="account-modal-actions">
            <button
              type="button"
              className="account-modal-cancel"
              onClick={() => setEditingName(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="account-modal-save"
              disabled={!firstName.trim() || !lastName.trim() || savingName}
            >
              {savingName ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      </dialog>

      <AccountAddressModal
        open={addressOpen}
        address={editingAddress}
        onClose={() => {
          setAddressOpen(false);
          setEditingAddress(null);
        }}
        onSaved={() => router.refresh()}
      />
    </section>
  );
}
