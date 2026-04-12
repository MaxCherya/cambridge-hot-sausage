"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

const COOKIE_KEY = "chs-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-lg animate-[slideUp_0.4s_ease-out] rounded-2xl border border-brand-maroon/10 bg-brand-cream p-5 shadow-[0_20px_60px_-15px_rgba(90,31,31,0.2)] sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-6">
      <div className="flex items-start gap-3">
        <Cookie size={20} className="mt-0.5 flex-shrink-0 text-brand-gold" />
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-ink">We use cookies</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-ink/55">
            We use essential cookies for site functionality and secure payments.
            No tracking or advertising cookies.{" "}
            <Link href="/legal/cookies" className="font-medium text-brand-maroon underline">
              Learn more
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={accept}
              className="rounded-full bg-brand-maroon px-4 py-1.5 text-xs font-semibold text-brand-cream transition-all duration-200 hover:bg-brand-ink"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={reject}
              className="rounded-full border border-brand-maroon/15 px-4 py-1.5 text-xs font-semibold text-brand-ink transition-all duration-200 hover:bg-brand-maroon/5"
            >
              Essential only
            </button>
          </div>
        </div>
        <button type="button" onClick={reject} className="text-brand-ink/30 hover:text-brand-ink/60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
