"use client";

import { useTransition } from "react";
import { Dropdown } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        aria-label={t("actions.changeLanguage")}
        isDisabled={isPending}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-brand-ink transition-colors hover:bg-brand-maroon/10"
      >
        <span className="font-display text-sm uppercase tracking-widest">
          {locale}
        </span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label={t("actions.changeLanguage")}
          selectionMode="single"
          selectedKeys={[locale]}
          onAction={(key) => onSelect(key as Locale)}
        >
          {routing.locales.map((code) => (
            <Dropdown.Item key={code} id={code}>
              {t(`locales.${code}`)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
