"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  Users,
  Calculator,
  PieChart,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Accounting", href: "/accounting", icon: Calculator },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/80" />
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full"
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex h-16 shrink-0 items-center px-6">
              <Logo />
            </div>
            <nav className="flex flex-1 flex-col gap-y-7 px-6 pb-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      "group flex items-center rounded-lg px-3 py-2 text-sm font-medium"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-accent-foreground",
                        "mr-3 h-5 w-5 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          "group flex items-center gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6"
                        )}
                      >
                        <item.icon
                          className={cn(
                            pathname === item.href
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-accent-foreground",
                            "h-5 w-5 flex-shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-x-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Calculator className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">XenFi Accounting</span>
    </Link>
  );
}
