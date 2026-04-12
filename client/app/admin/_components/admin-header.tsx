"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, User } from "lucide-react";
import { logout, type AdminUser } from "@/lib/admin/auth";
import { useSidebar } from "./sidebar";

interface AdminHeaderProps {
  user: AdminUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const { toggle } = useSidebar();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
          <User size={15} />
          <span className="font-medium">{user.username}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
