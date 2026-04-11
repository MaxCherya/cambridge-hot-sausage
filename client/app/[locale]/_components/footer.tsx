"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import logo from "@/img/logo.png";
import { Link } from "@/i18n/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type LinkKey =
  | "visitShop"
  | "events"
  | "about"
  | "locations"
  | "reviews"
  | "contact";

const SHOP_LINKS: { key: LinkKey; href: string }[] = [
  { key: "visitShop", href: "/shop" },
  { key: "events", href: "/events" },
];

const COMPANY_LINKS: { key: LinkKey; href: string }[] = [
  { key: "about", href: "/about" },
  { key: "locations", href: "/locations" },
  { key: "reviews", href: "/reviews" },
  { key: "contact", href: "/contact" },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkTween = useRef<gsap.core.Tween | null>(null);
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(
    () => {
      if (!root.current) return;

      // Block fade-up on enter
      gsap.from(root.current.querySelectorAll(".footer-block"), {
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });

      // Giant ghost wordmark — continuous linear marquee
      const track = wordmarkRef.current;
      if (track) {
        const setWidth = track.scrollWidth / 2;
        const speed = 50; // px / second
        wordmarkTween.current = gsap.to(track, {
          x: -setWidth,
          duration: setWidth / speed,
          ease: "none",
          repeat: -1,
        });

        const onResize = () => {
          if (!wordmarkRef.current || !wordmarkTween.current) return;
          const newWidth = wordmarkRef.current.scrollWidth / 2;
          wordmarkTween.current.kill();
          gsap.set(wordmarkRef.current, { x: 0 });
          wordmarkTween.current = gsap.to(wordmarkRef.current, {
            x: -newWidth,
            duration: newWidth / speed,
            ease: "none",
            repeat: -1,
          });
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }
    },
    { scope: root },
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to actual newsletter API (Django backend)
    setSubmitted(true);
  }

  return (
    <footer
      ref={root}
      id="site-footer"
      className="relative z-10 overflow-hidden bg-brand-maroon text-brand-cream"
    >
      {/* Curved divider into the cream content above */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12 w-full text-brand-cream sm:h-16"
        preserveAspectRatio="none"
        viewBox="0 0 1200 64"
      >
        <path d="M0,42 C300,4 900,4 1200,42 L1200,0 L0,0 Z" fill="currentColor" />
      </svg>

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]"
      />
      {/* Warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 sm:pt-40">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Brand */}
          <div className="footer-block lg:col-span-5">
            <Link
              href="/"
              className="group inline-block"
              aria-label={tCommon("brand")}
            >
              <div className="rounded-2xl bg-brand-cream p-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
                <Image
                  src={logo}
                  alt={tCommon("brand")}
                  className="h-14 w-auto"
                />
              </div>
            </Link>
            <p className="mt-6 max-w-md text-balance text-base text-brand-cream/80 sm:text-lg">
              {t("tagline")}
            </p>
            <address className="mt-6 not-italic text-sm leading-relaxed text-brand-cream/65">
              {t("address.line1")}
              <br />
              {t("address.line2")}
            </address>

            <div className="mt-10 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cream/55">
                {t("social.follow")}
              </span>
              <div className="h-px flex-1 bg-brand-cream/15" />
            </div>
            <div className="mt-4 flex gap-3">
              <SocialIcon href="https://instagram.com/" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com/" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com/" label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.43z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Shop */}
          <nav className="footer-block lg:col-span-2" aria-label={t("columns.shop")}>
            <h3 className="font-display text-base uppercase tracking-wider text-brand-gold">
              {t("columns.shop")}
            </h3>
            <ul className="mt-5 space-y-3">
              {SHOP_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <FooterLink href={href}>{t(`links.${key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav
            className="footer-block lg:col-span-2"
            aria-label={t("columns.company")}
          >
            <h3 className="font-display text-base uppercase tracking-wider text-brand-gold">
              {t("columns.company")}
            </h3>
            <ul className="mt-5 space-y-3">
              {COMPANY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <FooterLink href={href}>{t(`links.${key}`)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="footer-block lg:col-span-3">
            <h3 className="font-display text-base uppercase tracking-wider text-brand-gold">
              {t("newsletter.title")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-cream/70">
              {t("newsletter.description")}
            </p>
            <form onSubmit={onSubmit} className="mt-5">
              <div className="group relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  placeholder={t("newsletter.placeholder")}
                  aria-label={t("newsletter.title")}
                  className="peer w-full rounded-full border border-brand-cream/25 bg-brand-cream/5 px-5 py-3 pr-32 text-sm text-brand-cream placeholder:text-brand-cream/40 outline-none transition-colors focus:border-brand-gold focus:bg-brand-cream/10"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-maroon transition-transform duration-200 hover:scale-[1.04] active:scale-95"
                >
                  {t("newsletter.submit")}
                </button>
              </div>
              {submitted && (
                <p
                  role="status"
                  className="mt-3 text-xs text-brand-gold"
                >
                  {t("newsletter.success")}
                </p>
              )}
            </form>
          </div>
        </div>

      </div>

      {/* Giant ghost wordmark — continuous marquee */}
      <div className="mt-16 overflow-hidden pb-12 sm:mt-24 sm:pb-16" aria-hidden>
        <div
          ref={wordmarkRef}
          className="flex w-max items-end whitespace-nowrap will-change-transform"
        >
          <span className="block pr-10 font-display text-[clamp(3rem,15vw,11rem)] leading-none tracking-tight text-brand-cream/[0.08] sm:pr-16">
            CAMBRIDGE · HOT · SAUSAGE · CO ·
          </span>
          <span className="block pr-10 font-display text-[clamp(3rem,15vw,11rem)] leading-none tracking-tight text-brand-cream/[0.08] sm:pr-16">
            CAMBRIDGE · HOT · SAUSAGE · CO ·
          </span>
        </div>
      </div>

      {/* Bottom legal strip */}
      <div className="relative border-t border-brand-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-6 text-xs text-brand-cream/55 sm:flex-row sm:justify-between">
          <p>
            {t("bottom.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/legal/privacy"
              className="transition-colors hover:text-brand-gold"
            >
              {t("links.privacy")}
            </Link>
            <Link
              href="/legal/terms"
              className="transition-colors hover:text-brand-gold"
            >
              {t("links.terms")}
            </Link>
            <Link
              href="/legal/cookies"
              className="transition-colors hover:text-brand-gold"
            >
              {t("links.cookies")}
            </Link>
          </div>
          <p className="font-display tracking-wider text-brand-cream/65">
            {t("bottom.madeIn")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center text-sm text-brand-cream/70 transition-all duration-300 hover:translate-x-1 hover:text-brand-gold"
    >
      <span
        aria-hidden
        className="mr-0 inline-block w-0 overflow-hidden text-brand-gold opacity-0 transition-all duration-300 group-hover:mr-1.5 group-hover:w-3 group-hover:opacity-100"
      >
        →
      </span>
      <span>{children}</span>
    </Link>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-maroon"
    >
      {children}
    </a>
  );
}
