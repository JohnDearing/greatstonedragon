"use client";

import type { PromoPopupConfig } from "@/lib/promo-popups";
import { dismissPromo, isPromoDismissed } from "@/lib/promo-popups";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type PromoPopupProps = {
  promo: PromoPopupConfig;
};

export function PromoPopup({ promo }: PromoPopupProps) {
  const checkboxId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isPromoDismissed(promo.storageKey)) return;

    const timer = window.setTimeout(() => setOpen(true), 350);
    return () => window.clearTimeout(timer);
  }, [promo.storageKey]);

  const closePopup = useCallback(
    (persistDismissal: boolean) => {
      if (persistDismissal) {
        dismissPromo(promo.storageKey);
      }
      setOpen(false);
    },
    [promo.storageKey],
  );

  const handleClose = useCallback(() => {
    closePopup(dontShowAgain);
  }, [closePopup, dontShowAgain]);

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="promo-popup-layer" role="presentation">
      <button
        type="button"
        className="promo-popup-backdrop"
        aria-label="Close promotion"
        onClick={handleClose}
      />

      <div
        ref={dialogRef}
        className={`promo-popup${promo.kicker ? "" : " promo-popup--alert"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${promo.id}-title`}
        aria-describedby={`${promo.id}-body`}
        tabIndex={-1}
      >
        <button
          type="button"
          className="promo-popup-close"
          aria-label="Close promotion"
          onClick={handleClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M6 6l12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {promo.kicker ? (
          <p className="promo-popup-kicker">{promo.kicker}</p>
        ) : null}
        <h2 className="promo-popup-title" id={`${promo.id}-title`}>
          {promo.title}
        </h2>
        <p className="promo-popup-body" id={`${promo.id}-body`}>
          {promo.body}
        </p>
        {promo.note ? <p className="promo-popup-note">{promo.note}</p> : null}

        <div className="promo-popup-footer">
          <label className="promo-popup-dismiss" htmlFor={checkboxId}>
            <input
              id={checkboxId}
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
            />
            <span>Don&apos;t show this again</span>
          </label>
        </div>
      </div>
    </div>
  );
}
