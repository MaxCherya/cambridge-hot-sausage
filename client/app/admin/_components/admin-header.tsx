"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { logout, type AdminUser } from "@/lib/admin/auth";

interface AdminHeaderProps {
  user: AdminUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={15} />
          <span className="font-medium">{user.username}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </header>
  );
}
