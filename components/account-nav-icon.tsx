"use client";

import { useEffect, useState } from "react";

export function AccountNavIcon({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (active) setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <a
      href={authenticated ? "/account" : "/api/auth/login"}
      className="icon-btn"
      aria-label={authenticated ? "My account" : "Sign in"}
      onClick={onNavigate}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.2 19.2c1.5-3.2 3.8-4.8 6.8-4.8s5.3 1.6 6.8 4.8" />
      </svg>
    </a>
  );
}
