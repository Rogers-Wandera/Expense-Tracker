"use client";

import { ReactNode, useState } from "react";
import { ToastProvider } from "@/components/error-toast";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = useSession({
    required: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (session.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar
          user={session?.data.user as any}
          onCollapseChange={setSidebarCollapsed}
        />
        {/* Remove pt-16 and use proper sidebar width calculation */}
        <div
          className={`
          transition-all duration-300
          ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
        `}
        >
          <DashboardHeader user={session.data.user as any} />
          <main className="py-6 lg:py-8">
            {/* Add proper padding that respects sidebar */}
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
