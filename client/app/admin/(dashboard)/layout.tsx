"use client";

import { AdminQueryProvider } from "../_components/admin-query-provider";
import { AuthProvider, useAuth } from "../_components/auth-provider";
import { Sidebar, SidebarProvider } from "../_components/sidebar";
import { AdminHeader } from "../_components/admin-header";
import { ToastProvider } from "../_components/toast-provider";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          {user && <AdminHeader user={user} />}
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminQueryProvider>
      <AuthProvider>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
        <ToastProvider />
      </AuthProvider>
    </AdminQueryProvider>
  );
}
