"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  Calendar,
  CalendarOff,
  FolderTree,
  Mail,
  MessageSquare,
  Settings,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", icon: BarChart3, label: "Dashboard" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/admin/products", icon: Box, label: "Products" },
      { href: "/admin/categories", icon: FolderTree, label: "Categories" },
      { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { href: "/admin/reviews", icon: Star, label: "Reviews" },
    ],
  },
  {
    label: "Events",
    items: [
      { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
      { href: "/admin/event-config", icon: Settings, label: "Pricing" },
      { href: "/admin/blocked-dates", icon: CalendarOff, label: "Blocked Dates" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
      { href: "/admin/newsletter", icon: Mail, label: "Newsletter" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#5A1F1F] text-[#F5F1E8]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECD691] text-[#5A1F1F]">
          <Box size={16} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-wide">CHS Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <span className="mb-2 block px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {section.label}
            </span>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white/15 font-medium text-[#ECD691]"
                          : "text-white/65 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-3">
        <Link
          href="/"
          className="text-[10px] font-medium uppercase tracking-wider text-white/30 transition-colors hover:text-[#ECD691]"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
