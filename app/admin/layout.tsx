"use client";
import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ConfirmDialogProvider } from "@/components/admin/ConfirmDialog";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <ConfirmDialogProvider><div className="viewport-min-height overflow-x-hidden bg-gray-50">
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="viewport-height overflow-y-auto overscroll-contain pt-16 lg:mr-64"><div className="p-4 lg:p-6">{children}</div></main>
    </div></ConfirmDialogProvider>
  );
}
