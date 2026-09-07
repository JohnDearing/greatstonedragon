"use client";

import { CartToast } from "@/components/cart-toast";
import { sendContactMessage } from "@/lib/send-contact";
import { showStoreAlert } from "@/lib/store-alerts";
import { FormEvent, useCallback, useState } from "react";

export default function ContactFormSection() {
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: String(data.get("firstName") ?? "").trim(),
      lastName: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      showStoreAlert("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await sendContactMessage(payload);
      form.reset();
      setToastVisible(true);
    } catch (error) {
      showStoreAlert(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-[#f5f5f5] py-8 sm:py-10 md:py-14 lg:py-16">
      <div className="container">
        <form className="mx-auto max-w-6xl" onSubmit={handleSubmit} noValidate>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="email"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="subject"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="message"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-xl border border-[#d6d6d6] bg-white px-4 py-3 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:rounded-2xl sm:text-lg md:py-4 md:text-xl"
            />
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="min-w-30 rounded-full bg-[var(--brand)] px-8 py-2.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-36 sm:px-10 sm:py-3 sm:text-lg md:text-xl"
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>

      <CartToast
        message="Message sent"
        description="Thanks for contacting us! We'll get back to you as soon as possible."
        visible={toastVisible}
        onDismiss={dismissToast}
      />
    </section>
  );
}
