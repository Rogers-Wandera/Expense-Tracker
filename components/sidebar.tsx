// // "use client";

// // import { useState } from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import {
// //   IconDashboard,
// //   IconReceipt,
// //   IconCalculator,
// //   IconChartBar,
// //   IconFileText,
// //   IconUsers,
// //   IconSettings,
// //   IconLogout,
// //   IconMenu2,
// //   IconX,
// //   IconChevronRight,
// //   IconBuildingBank,
// //   IconReport,
// //   IconWallet,
// //   IconCategory,
// //   IconHelp,
// //   IconMoon,
// //   IconSun,
// // } from "@tabler/icons-react";
// // import { Avatar, Button, Divider, Tooltip, Badge, Switch } from "@heroui/react";
// // import { useTheme } from "next-themes";
// // import { LogoutButton } from "./logout-button";

// // interface SidebarItem {
// //   name: string;
// //   href: string;
// //   icon: React.ReactNode;
// //   badge?: number;
// //   isActive?: boolean;
// // }

// // interface DashboardSidebarProps {
// //   user: {
// //     id: string;
// //     email: string;
// //     firstName: string;
// //     lastName: string;
// //     image?: string;
// //     isVerified?: boolean;
// //   };
// // }

// // export function DashboardSidebar({ user }: DashboardSidebarProps) {
// //   const pathname = usePathname();
// //   const [collapsed, setCollapsed] = useState(false);
// //   const { theme, setTheme } = useTheme();
// //   const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

// //   const navigation: SidebarItem[] = [
// //     {
// //       name: "Dashboard",
// //       href: "/dashboard",
// //       icon: <IconDashboard className="w-5 h-5" />,
// //     },
// //     {
// //       name: "Expenses",
// //       href: "/expenses",
// //       icon: <IconReceipt className="w-5 h-5" />,
// //       badge: 12,
// //     },
// //     {
// //       name: "Accounting",
// //       href: "/accounting",
// //       icon: <IconCalculator className="w-5 h-5" />,
// //     },
// //     {
// //       name: "Reports",
// //       href: "/reports",
// //       icon: <IconChartBar className="w-5 h-5" />,
// //     },
// //     {
// //       name: "Documents",
// //       href: "/documents",
// //       icon: <IconFileText className="w-5 h-5" />,
// //     },
// //     {
// //       name: "Team",
// //       href: "/team",
// //       icon: <IconUsers className="w-5 h-5" />,
// //     },
// //     {
// //       name: "Settings",
// //       href: "/settings",
// //       icon: <IconSettings className="w-5 h-5" />,
// //     },
// //   ];

// //   const accountingSubmenu = [
// //     { name: "Chart of Accounts", href: "/accounting/chart" },
// //     { name: "Journal Entries", href: "/accounting/journal" },
// //     { name: "General Ledger", href: "/accounting/ledger" },
// //     { name: "Trial Balance", href: "/accounting/trial-balance" },
// //     { name: "Financial Statements", href: "/accounting/statements" },
// //   ];

// //   const reportsSubmenu = [
// //     { name: "Profit & Loss", href: "/reports/profit-loss" },
// //     { name: "Balance Sheet", href: "/reports/balance-sheet" },
// //     { name: "Cash Flow", href: "/reports/cash-flow" },
// //     { name: "Expense Analysis", href: "/reports/expense-analysis" },
// //     { name: "Tax Reports", href: "/reports/tax" },
// //   ];

// //   const toggleSubmenu = (menu: string) => {
// //     setActiveSubmenu(activeSubmenu === menu ? null : menu);
// //   };

// //   const isActive = (href: string) => {
// //     if (href === "/dashboard") {
// //       return pathname === "/dashboard";
// //     }
// //     return pathname.startsWith(href);
// //   };

// //   const toggleTheme = () => {
// //     setTheme(theme === "dark" ? "light" : "dark");
// //   };

// //   return (
// //     <>
// //       {/* Mobile sidebar toggle */}
// //       <div className="lg:hidden fixed top-4 left-4 z-50">
// //         <Button
// //           isIconOnly
// //           variant="flat"
// //           size="sm"
// //           onPress={() => setCollapsed(!collapsed)}
// //           className="bg-white dark:bg-gray-800 shadow-lg"
// //         >
// //           {collapsed ? (
// //             <IconX className="w-5 h-5" />
// //           ) : (
// //             <IconMenu2 className="w-5 h-5" />
// //           )}
// //         </Button>
// //       </div>

// //       {/* Sidebar overlay for mobile */}
// //       {collapsed && (
// //         <div
// //           className="lg:hidden fixed inset-0 bg-black/50 z-40"
// //           onClick={() => setCollapsed(false)}
// //         />
// //       )}

// //       {/* Sidebar */}
// //       <aside
// //         className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
// //           collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
// //         } ${
// //           collapsed ? "w-72" : "w-0 lg:w-72"
// //         } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}
// //       >
// //         {/* Logo and brand */}
// //         <div className="p-6 border-b border-gray-200 dark:border-gray-800">
// //           <div className="flex items-center justify-between">
// //             <Link href="/dashboard" className="flex items-center gap-3">
// //               <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
// //                 <IconBuildingBank className="w-6 h-6 text-white" />
// //               </div>
// //               <div>
// //                 <h1 className="text-xl font-bold text-gray-900 dark:text-white">
// //                   XenFi
// //                 </h1>
// //                 <p className="text-xs text-gray-500 dark:text-gray-400">
// //                   Expense Manager
// //                 </p>
// //               </div>
// //             </Link>

// //             <Tooltip content="Toggle sidebar">
// //               <Button
// //                 isIconOnly
// //                 variant="light"
// //                 size="sm"
// //                 className="hidden lg:flex"
// //                 onPress={() => setCollapsed(!collapsed)}
// //               >
// //                 <IconChevronRight className="w-4 h-4" />
// //               </Button>
// //             </Tooltip>
// //           </div>
// //         </div>

// //         {/* Navigation */}
// //         <nav className="flex-1 p-4 overflow-y-auto">
// //           <div className="space-y-1">
// //             {navigation.map((item) => (
// //               <div key={item.name}>
// //                 <Link
// //                   href={item.href}
// //                   className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
// //                     isActive(item.href)
// //                       ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
// //                       : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
// //                   }`}
// //                   onClick={() => setCollapsed(false)}
// //                 >
// //                   <div
// //                     className={`${
// //                       isActive(item.href)
// //                         ? "text-blue-600 dark:text-blue-400"
// //                         : "text-gray-400"
// //                     }`}
// //                   >
// //                     {item.icon}
// //                   </div>
// //                   <span className="font-medium flex-1">{item.name}</span>
// //                   {item.badge && (
// //                     <Badge size="sm" color="danger" variant="flat">
// //                       {item.badge}
// //                     </Badge>
// //                   )}
// //                 </Link>

// //                 {/* Accounting submenu */}
// //                 {item.name === "Accounting" && isActive("/accounting") && (
// //                   <div className="ml-12 mt-1 space-y-1">
// //                     {accountingSubmenu.map((subItem) => (
// //                       <Link
// //                         key={subItem.name}
// //                         href={subItem.href}
// //                         className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
// //                           pathname === subItem.href
// //                             ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
// //                             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
// //                         }`}
// //                       >
// //                         <div className="w-1 h-1 rounded-full bg-current" />
// //                         {subItem.name}
// //                       </Link>
// //                     ))}
// //                   </div>
// //                 )}

// //                 {/* Reports submenu */}
// //                 {item.name === "Reports" && isActive("/reports") && (
// //                   <div className="ml-12 mt-1 space-y-1">
// //                     {reportsSubmenu.map((subItem) => (
// //                       <Link
// //                         key={subItem.name}
// //                         href={subItem.href}
// //                         className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
// //                           pathname === subItem.href
// //                             ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
// //                             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
// //                         }`}
// //                       >
// //                         <div className="w-1 h-1 rounded-full bg-current" />
// //                         {subItem.name}
// //                       </Link>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </div>

// //           <Divider className="my-6" />

// //           {/* Quick actions */}
// //           <div className="mb-6">
// //             <h4 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //               Quick Actions
// //             </h4>
// //             <div className="space-y-1">
// //               <Button
// //                 variant="flat"
// //                 color="primary"
// //                 className="w-full justify-start"
// //                 startContent={<IconWallet className="w-4 h-4" />}
// //               >
// //                 Add Expense
// //               </Button>
// //               <Button
// //                 variant="flat"
// //                 color="secondary"
// //                 className="w-full justify-start"
// //                 startContent={<IconCategory className="w-4 h-4" />}
// //               >
// //                 Manage Categories
// //               </Button>
// //               <Button
// //                 variant="flat"
// //                 color="success"
// //                 className="w-full justify-start"
// //                 startContent={<IconReport className="w-4 h-4" />}
// //               >
// //                 Generate Report
// //               </Button>
// //             </div>
// //           </div>
// //         </nav>

// //         {/* Bottom section */}
// //         <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
// //           {/* Theme toggle */}
// //           <div className="flex items-center justify-between px-2">
// //             <div className="flex items-center gap-2">
// //               {theme === "dark" ? (
// //                 <IconMoon className="w-4 h-4 text-gray-400" />
// //               ) : (
// //                 <IconSun className="w-4 h-4 text-gray-400" />
// //               )}
// //               <span className="text-sm text-gray-600 dark:text-gray-400">
// //                 Dark Mode
// //               </span>
// //             </div>
// //             <Switch
// //               size="sm"
// //               isSelected={theme === "dark"}
// //               onValueChange={toggleTheme}
// //             />
// //           </div>

// //           {/* Help and support */}
// //           <div className="flex items-center justify-between px-2">
// //             <Button
// //               variant="light"
// //               size="sm"
// //               startContent={<IconHelp className="w-4 h-4" />}
// //               className="text-gray-600 dark:text-gray-400"
// //             >
// //               Help & Support
// //             </Button>
// //             <Badge size="sm" color="danger" variant="flat">
// //               3
// //             </Badge>
// //           </div>

// //           {/* Logout */}
// //           <div className="px-2">
// //             <LogoutButton
// //               variant="light"
// //               size="sm"
// //               className="w-full justify-start text-red-600 dark:text-red-400"
// //               icon={<IconLogout className="w-4 h-4" />}
// //             />
// //           </div>

// //           {/* App version */}
// //           <div className="px-2">
// //             <p className="text-xs text-center text-gray-500 dark:text-gray-400">
// //               v1.0.0 • XenFi Expense Manager
// //             </p>
// //           </div>
// //         </div>
// //       </aside>
// //     </>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   IconDashboard,
//   IconReceipt,
//   IconCalculator,
//   IconChartBar,
//   IconFileText,
//   IconUsers,
//   IconSettings,
//   IconLogout,
//   IconMenu2,
//   IconX,
//   IconChevronRight,
//   IconBuildingBank,
//   IconReport,
//   IconWallet,
//   IconCategory,
//   IconHelp,
//   IconMoon,
//   IconSun,
// } from "@tabler/icons-react";
// import { Avatar, Button, Divider, Tooltip, Badge, Switch } from "@heroui/react";
// import { useTheme } from "next-themes";
// import { LogoutButton } from "./logout-button";

// interface SidebarItem {
//   name: string;
//   href: string;
//   icon: React.ReactNode;
//   badge?: number;
//   isActive?: boolean;
// }

// interface DashboardSidebarProps {
//   user: {
//     id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     image?: string;
//     isVerified?: boolean;
//   };
//   onCollapseChange?: (collapsed: boolean) => void;
// }

// export function DashboardSidebar({
//   user,
//   onCollapseChange,
// }: DashboardSidebarProps) {
//   const pathname = usePathname();
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   const handleDesktopCollapse = (collapsed: boolean) => {
//     setIsDesktopCollapsed(collapsed);
//     onCollapseChange?.(collapsed);
//   };

//   // Detect mobile screen
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024); // lg breakpoint
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const navigation: SidebarItem[] = [
//     {
//       name: "Dashboard",
//       href: "/dashboard",
//       icon: <IconDashboard className="w-5 h-5" />,
//     },
//     {
//       name: "Expenses",
//       href: "/expenses",
//       icon: <IconReceipt className="w-5 h-5" />,
//       badge: 12,
//     },
//     {
//       name: "Accounting",
//       href: "/accounting",
//       icon: <IconCalculator className="w-5 h-5" />,
//     },
//     {
//       name: "Reports",
//       href: "/reports",
//       icon: <IconChartBar className="w-5 h-5" />,
//     },
//     {
//       name: "Documents",
//       href: "/documents",
//       icon: <IconFileText className="w-5 h-5" />,
//     },
//     {
//       name: "Team",
//       href: "/team",
//       icon: <IconUsers className="w-5 h-5" />,
//     },
//     {
//       name: "Settings",
//       href: "/settings",
//       icon: <IconSettings className="w-5 h-5" />,
//     },
//   ];

//   const accountingSubmenu = [
//     { name: "Chart of Accounts", href: "/accounting/chart" },
//     { name: "Journal Entries", href: "/accounting/journal" },
//     { name: "General Ledger", href: "/accounting/ledger" },
//     { name: "Trial Balance", href: "/accounting/trial-balance" },
//     { name: "Financial Statements", href: "/accounting/statements" },
//   ];

//   const reportsSubmenu = [
//     { name: "Profit & Loss", href: "/reports/profit-loss" },
//     { name: "Balance Sheet", href: "/reports/balance-sheet" },
//     { name: "Cash Flow", href: "/reports/cash-flow" },
//     { name: "Expense Analysis", href: "/reports/expense-analysis" },
//     { name: "Tax Reports", href: "/reports/tax" },
//   ];

//   const toggleSubmenu = (menu: string) => {
//     setActiveSubmenu(activeSubmenu === menu ? null : menu);
//   };

//   const isActive = (href: string) => {
//     if (href === "/dashboard") {
//       return pathname === "/dashboard";
//     }
//     return pathname.startsWith(href);
//   };

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark");
//   };

//   // Close mobile sidebar when clicking a link
//   const handleLinkClick = () => {
//     if (isMobile) {
//       setIsMobileOpen(false);
//     }
//   };

//   // Determine sidebar state
//   const isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
//   const sidebarWidth = isMobile
//     ? "w-72"
//     : isDesktopCollapsed
//     ? "w-0 lg:w-20"
//     : "w-72";

//   return (
//     <>
//       {/* Mobile sidebar toggle */}
//       <div className="lg:hidden fixed top-4 left-4 z-50">
//         <Button
//           isIconOnly
//           variant="flat"
//           size="sm"
//           onPress={() => setIsMobileOpen(!isMobileOpen)}
//           className="bg-white dark:bg-gray-800 shadow-lg"
//         >
//           {isMobileOpen ? (
//             <IconX className="w-5 h-5" />
//           ) : (
//             <IconMenu2 className="w-5 h-5" />
//           )}
//         </Button>
//       </div>

//       {/* Sidebar overlay for mobile */}
//       {isMobile && isMobileOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/50 z-40"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
//           isMobile
//             ? isMobileOpen
//               ? "translate-x-0"
//               : "-translate-x-full"
//             : isDesktopCollapsed
//             ? "-translate-x-full lg:translate-x-0"
//             : "translate-x-0"
//         } ${sidebarWidth} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden`}
//       >
//         {/* Logo and brand */}
//         <div className="p-6 border-b border-gray-200 dark:border-gray-800">
//           <div className="flex items-center justify-between">
//             <Link
//               href="/dashboard"
//               className="flex items-center gap-3 min-w-0"
//               onClick={handleLinkClick}
//             >
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <IconBuildingBank className="w-6 h-6 text-white" />
//               </div>
//               {!isDesktopCollapsed && (
//                 <div className="min-w-0">
//                   <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
//                     XenFi
//                   </h1>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                     Expense Manager
//                   </p>
//                 </div>
//               )}
//             </Link>

//             {!isMobile && (
//               <Tooltip
//                 content={
//                   isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
//                 }
//               >
//                 <Button
//                   isIconOnly
//                   variant="light"
//                   size="sm"
//                   className="hidden lg:flex flex-shrink-0"
//                   onPress={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
//                 >
//                   <IconChevronRight
//                     className={`w-4 h-4 transition-transform ${
//                       isDesktopCollapsed ? "" : "rotate-180"
//                     }`}
//                   />
//                 </Button>
//               </Tooltip>
//             )}
//           </div>
//         </div>

//         {/* User profile - Only show when not collapsed */}
//         {!isDesktopCollapsed && (
//           <div className="p-6 border-b border-gray-200 dark:border-gray-800">
//             <div className="flex items-center gap-3">
//               <Avatar
//                 src={user.image}
//                 name={`${user.firstName} ${user.lastName}`}
//                 className="w-12 h-12 text-lg font-semibold flex-shrink-0"
//                 classNames={{
//                   base: "bg-gradient-to-br from-blue-500 to-purple-500",
//                   name: "text-white font-semibold",
//                 }}
//               />
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 dark:text-white truncate">
//                   {user.firstName} {user.lastName}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
//                   {user.email}
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <Badge
//                     size="sm"
//                     color={user.isVerified ? "success" : "warning"}
//                     variant="flat"
//                   >
//                     {user.isVerified ? "Verified" : "Pending"}
//                   </Badge>
//                   <Badge size="sm" color="primary" variant="flat">
//                     Admin
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="flex-1 p-4 overflow-y-auto">
//           <div className="space-y-1">
//             {navigation.map((item) => (
//               <div key={item.name}>
//                 <Link
//                   href={item.href}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                     isActive(item.href)
//                       ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
//                       : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
//                   } ${isDesktopCollapsed ? "justify-center" : ""}`}
//                   onClick={handleLinkClick}
//                 >
//                   <div
//                     className={`${
//                       isActive(item.href)
//                         ? "text-blue-600 dark:text-blue-400"
//                         : "text-gray-400"
//                     }`}
//                   >
//                     {item.icon}
//                   </div>
//                   {!isDesktopCollapsed && (
//                     <>
//                       <span className="font-medium flex-1 truncate">
//                         {item.name}
//                       </span>
//                       {item.badge && (
//                         <Badge size="sm" color="danger" variant="flat">
//                           {item.badge}
//                         </Badge>
//                       )}
//                     </>
//                   )}
//                 </Link>

//                 {/* Submenus - Only show when not collapsed */}
//                 {!isDesktopCollapsed && (
//                   <>
//                     {/* Accounting submenu */}
//                     {item.name === "Accounting" && isActive("/accounting") && (
//                       <div className="ml-12 mt-1 space-y-1">
//                         {accountingSubmenu.map((subItem) => (
//                           <Link
//                             key={subItem.name}
//                             href={subItem.href}
//                             className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
//                               pathname === subItem.href
//                                 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
//                                 : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
//                             }`}
//                             onClick={handleLinkClick}
//                           >
//                             <div className="w-1 h-1 rounded-full bg-current" />
//                             {subItem.name}
//                           </Link>
//                         ))}
//                       </div>
//                     )}

//                     {/* Reports submenu */}
//                     {item.name === "Reports" && isActive("/reports") && (
//                       <div className="ml-12 mt-1 space-y-1">
//                         {reportsSubmenu.map((subItem) => (
//                           <Link
//                             key={subItem.name}
//                             href={subItem.href}
//                             className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
//                               pathname === subItem.href
//                                 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
//                                 : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
//                             }`}
//                             onClick={handleLinkClick}
//                           >
//                             <div className="w-1 h-1 rounded-full bg-current" />
//                             {subItem.name}
//                           </Link>
//                         ))}
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Quick actions - Only show when not collapsed */}
//           {!isDesktopCollapsed && (
//             <>
//               <Divider className="my-6" />

//               <div className="mb-6">
//                 <h4 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Quick Actions
//                 </h4>
//                 <div className="space-y-1">
//                   <Button
//                     variant="flat"
//                     color="primary"
//                     className="w-full justify-start"
//                     startContent={<IconWallet className="w-4 h-4" />}
//                     onClick={handleLinkClick}
//                   >
//                     Add Expense
//                   </Button>
//                   <Button
//                     variant="flat"
//                     color="secondary"
//                     className="w-full justify-start"
//                     startContent={<IconCategory className="w-4 h-4" />}
//                     onClick={handleLinkClick}
//                   >
//                     Manage Categories
//                   </Button>
//                   <Button
//                     variant="flat"
//                     color="success"
//                     className="w-full justify-start"
//                     startContent={<IconReport className="w-4 h-4" />}
//                     onClick={handleLinkClick}
//                   >
//                     Generate Report
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </nav>

//         {/* Bottom section - Always show but adapt to collapsed state */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
//           {/* Theme toggle */}
//           <div
//             className={`flex items-center justify-between px-2 ${
//               isDesktopCollapsed ? "justify-center" : ""
//             }`}
//           >
//             {!isDesktopCollapsed && (
//               <div className="flex items-center gap-2">
//                 {theme === "dark" ? (
//                   <IconMoon className="w-4 h-4 text-gray-400" />
//                 ) : (
//                   <IconSun className="w-4 h-4 text-gray-400" />
//                 )}
//                 <span className="text-sm text-gray-600 dark:text-gray-400">
//                   Dark Mode
//                 </span>
//               </div>
//             )}
//             <Switch
//               size="sm"
//               isSelected={theme === "dark"}
//               onValueChange={toggleTheme}
//               className={isDesktopCollapsed ? "mx-auto" : ""}
//             />
//           </div>

//           {/* Help and support - Only show when not collapsed */}
//           {!isDesktopCollapsed && (
//             <div className="flex items-center justify-between px-2">
//               <Button
//                 variant="light"
//                 size="sm"
//                 startContent={<IconHelp className="w-4 h-4" />}
//                 className="text-gray-600 dark:text-gray-400 justify-start"
//                 onClick={handleLinkClick}
//               >
//                 Help & Support
//               </Button>
//               <Badge size="sm" color="danger" variant="flat">
//                 3
//               </Badge>
//             </div>
//           )}

//           {/* Logout */}
//           <div className="px-2">
//             <LogoutButton
//               variant="light"
//               size="sm"
//               className={`w-full justify-start text-red-600 dark:text-red-400 ${
//                 isDesktopCollapsed ? "justify-center" : ""
//               }`}
//               icon={<IconLogout className="w-4 h-4" />}
//               showIcon={!isDesktopCollapsed}
//             />
//           </div>

//           {/* App version - Only show when not collapsed */}
//           {!isDesktopCollapsed && (
//             <div className="px-2">
//               <p className="text-xs text-center text-gray-500 dark:text-gray-400">
//                 v1.0.0 • XenFi Expense Manager
//               </p>
//             </div>
//           )}
//         </div>
//       </aside>

//       {/* Main content margin adjustment */}
//       <div
//         className={`transition-all duration-300 ${
//           isMobile ? "" : isDesktopCollapsed ? "lg:ml-20" : "lg:ml-72"
//         }`}
//       />
//     </>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconReceipt,
  IconCalculator,
  IconChartBar,
  IconFileText,
  IconUsers,
  IconSettings,
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
} from "@tabler/icons-react";
import { Avatar, Button, Divider, Tooltip, Badge, Switch } from "@heroui/react";
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

export function DashboardSidebar({
  user,
  onCollapseChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      href: "/expenses",
      icon: <IconReceipt className="w-5 h-5" />,
      badge: 12,
    },
    {
      name: "Accounting",
      href: "/accounting",
      icon: <IconCalculator className="w-5 h-5" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <IconChartBar className="w-5 h-5" />,
    },
    {
      name: "Documents",
      href: "/documents",
      icon: <IconFileText className="w-5 h-5" />,
    },
    {
      name: "Team",
      href: "/team",
      icon: <IconUsers className="w-5 h-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <IconSettings className="w-5 h-5" />,
    },
  ];

  const accountingSubmenu = [
    { name: "Chart of Accounts", href: "/accounting/chart" },
    { name: "Journal Entries", href: "/accounting/journal" },
    { name: "General Ledger", href: "/accounting/ledger" },
    { name: "Trial Balance", href: "/accounting/trial-balance" },
    { name: "Financial Statements", href: "/accounting/statements" },
  ];

  const reportsSubmenu = [
    { name: "Profit & Loss", href: "/reports/profit-loss" },
    { name: "Balance Sheet", href: "/reports/balance-sheet" },
    { name: "Cash Flow", href: "/reports/cash-flow" },
    { name: "Expense Analysis", href: "/reports/expense-analysis" },
    { name: "Tax Reports", href: "/reports/tax" },
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

                {/* Submenus - Only show when not collapsed */}
                {!isDesktopCollapsed && (
                  <>
                    {/* Accounting submenu */}
                    {item.name === "Accounting" && isActive("/accounting") && (
                      <div className="ml-12 mt-1 space-y-1">
                        {accountingSubmenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                              pathname === subItem.href
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <div className="w-1 h-1 rounded-full bg-current" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Reports submenu */}
                    {item.name === "Reports" && isActive("/reports") && (
                      <div className="ml-12 mt-1 space-y-1">
                        {reportsSubmenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                              pathname === subItem.href
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <div className="w-1 h-1 rounded-full bg-current" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
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
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Add Expense
                  </Button>
                  <Button
                    variant="flat"
                    color="secondary"
                    className="w-full justify-start"
                    startContent={<IconCategory className="w-4 h-4" />}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Manage Categories
                  </Button>
                  <Button
                    variant="flat"
                    color="success"
                    className="w-full justify-start"
                    startContent={<IconReport className="w-4 h-4" />}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Generate Report
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

          {/* Help and support - Only show when not collapsed */}
          {!isDesktopCollapsed && (
            <div className="flex items-center justify-between">
              <Button
                variant="light"
                size="sm"
                startContent={<IconHelp className="w-4 h-4" />}
                className="text-gray-600 dark:text-gray-400"
                onClick={() => setIsMobileOpen(false)}
              >
                Help & Support
              </Button>
              <Badge size="sm" color="danger" variant="flat">
                3
              </Badge>
            </div>
          )}

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
