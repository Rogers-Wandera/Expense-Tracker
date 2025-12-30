"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDashboard,
  IconReceipt,
  IconUsers,
  IconLogout,
  IconMenu2,
  IconX,
  IconChevronRight,
  IconBuildingBank,
  IconReport,
  IconWallet,
  IconCategory,
  IconHelp,
  IconMoon,
  IconSun,
  IconBuilding,
  IconCategoryFilled,
} from "@tabler/icons-react";
import { Button, Divider, Tooltip, Badge, Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { LogoutButton } from "./logout-button";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  isActive?: boolean;
}

interface DashboardSidebarProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
    isVerified?: boolean;
  };
  onCollapseChange?: (collapsed: boolean) => void;
}

export function DashboardSidebar({ onCollapseChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsDesktopCollapsed(false); // Always expanded on mobile when shown
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Notify parent of collapse state change
  useEffect(() => {
    onCollapseChange?.(isDesktopCollapsed);
  }, [isDesktopCollapsed, onCollapseChange]);

  const navigation: SidebarItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <IconDashboard className="w-5 h-5" />,
    },
    {
      name: "Expenses",
      href: "/dashboard/expenses",
      icon: <IconReceipt className="w-5 h-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <IconUsers className="w-5 h-5" />,
    },
    {
      name: "Departments",
      href: "/dashboard/departments",
      icon: <IconBuilding className="w-5 h-5" />,
    },
    {
      name: "Categories",
      href: "/dashboard/categories",
      icon: <IconCategoryFilled className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleDesktopCollapse = () => {
    const newState = !isDesktopCollapsed;
    setIsDesktopCollapsed(newState);
    onCollapseChange?.(newState);
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onPress={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          {isMobileOpen ? (
            <IconX className="w-5 h-5" />
          ) : (
            <IconMenu2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          isMobile
            ? isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : isDesktopCollapsed
            ? "w-20"
            : "w-72"
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}
      >
        {/* Logo and brand */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 ${
                isDesktopCollapsed ? "justify-center" : ""
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <IconBuildingBank className="w-6 h-6 text-white" />
              </div>
              {!isDesktopCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    XenFi
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expense Manager
                  </p>
                </div>
              )}
            </Link>

            {!isMobile && (
              <Tooltip
                content={
                  isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="hidden lg:flex"
                  onPress={handleDesktopCollapse}
                >
                  <IconChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isDesktopCollapsed ? "" : "rotate-180"
                    }`}
                  />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${isDesktopCollapsed ? "justify-center" : ""}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div
                    className={`${
                      isActive(item.href)
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!isDesktopCollapsed && (
                    <>
                      <span className="font-medium flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge
                          size="sm"
                          color="primary"
                          content={item.badge}
                          variant="flat"
                        >
                          <></>
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Quick actions - Only show when not collapsed */}
          {!isDesktopCollapsed && (
            <>
              <Divider className="my-6" />

              <div className="mb-6">
                <h4 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="space-y-1">
                  <Button
                    variant="flat"
                    color="primary"
                    className="w-full justify-start"
                    startContent={<IconWallet className="w-4 h-4" />}
                    onPress={() => {
                      setIsMobileOpen(false);
                      router.push("/dashboard/expenses");
                    }}
                  >
                    Add Expense
                  </Button>
                  <Button
                    variant="flat"
                    color="secondary"
                    className="w-full justify-start"
                    startContent={<IconCategory className="w-4 h-4" />}
                    onPress={() => {
                      setIsMobileOpen(false);
                      router.push("/dashboard/categories");
                    }}
                  >
                    Manage Categories
                  </Button>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          {/* Theme toggle */}
          <div
            className={`flex items-center ${
              isDesktopCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isDesktopCollapsed && (
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <IconMoon className="w-4 h-4 text-gray-400" />
                ) : (
                  <IconSun className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dark Mode
                </span>
              </div>
            )}
            <Switch
              size="sm"
              isSelected={theme === "dark"}
              onValueChange={toggleTheme}
              className={isDesktopCollapsed ? "" : ""}
            />
          </div>

          {/* Logout */}
          <div>
            <LogoutButton
              variant="light"
              size="sm"
              className={`w-full justify-start text-red-600 dark:text-red-400 ${
                isDesktopCollapsed ? "justify-center" : ""
              }`}
              icon={<IconLogout className="w-4 h-4" />}
              showIcon={!isDesktopCollapsed}
            />
          </div>

          {/* App version - Only show when not collapsed */}
          {!isDesktopCollapsed && (
            <div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                v1.0.0 • XenFi Expense Manager
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
