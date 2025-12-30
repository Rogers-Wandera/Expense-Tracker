"use client";

import { useState } from "react";
import {
  IconSearch,
  IconChevronDown,
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconPlus,
} from "@tabler/icons-react";
import {
  Avatar,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
} from "@heroui/react";
import { LogoutButton } from "./logout-button";
import { useTheme } from "next-themes";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* First row: Title and User */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.firstName}
              </p>
            </div>

            {/* User menu - positioned properly */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800"
                  isIconOnly
                >
                  <Avatar
                    src={user.image}
                    name={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 text-sm"
                    classNames={{
                      base: "bg-gradient-to-br from-blue-500 to-purple-500",
                      name: "text-white font-semibold",
                    }}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="profile"
                  startContent={<IconUser className="w-4 h-4" />}
                  href="/profile"
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="theme"
                  startContent={
                    theme === "dark" ? (
                      <IconSun className="w-4 h-4" />
                    ) : (
                      <IconMoon className="w-4 h-4" />
                    )
                  }
                  endContent={
                    <Switch
                      size="sm"
                      isSelected={theme === "dark"}
                      onValueChange={toggleTheme}
                    />
                  }
                  isReadOnly
                >
                  Dark Mode
                </DropdownItem>
                <DropdownItem key="divider1" isReadOnly className="opacity-100">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  startContent={<IconLogout className="w-4 h-4" />}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogoutButton
                    variant="light"
                    className="w-full justify-start"
                    showIcon={false}
                  />
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Second row: Search and Add button */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-10 bg-gray-100 dark:bg-gray-800 border-none",
                }}
                size="sm"
              />
            </form>

            <Button
              color="primary"
              size="sm"
              startContent={<IconPlus className="w-4 h-4" />}
              className="whitespace-nowrap shrink-0"
            >
              Add
            </Button>
          </div>

          {/* Third row: Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                $42,389
              </p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-lg font-bold text-green-600">+$2,450</p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-amber-600">12</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - Page title and breadcrumb */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-500">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Overview
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-2">
              <div className="text-left">
                <p className="text-xs text-gray-500">Total Balance</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  $42,389.12
                </p>
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
              <div className="text-left">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  +$2,450.80
                </p>
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
              <div className="text-left">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-amber-600">
                  12
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex-1 sm:flex-none sm:max-w-xs"
            >
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-10 bg-gray-100 dark:bg-gray-800 border-none",
                }}
                size="sm"
              />
            </form>

            {/* Add Expense Button */}
            <Button
              color="primary"
              size="sm"
              startContent={<IconPlus className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Add Expense
            </Button>

            {/* User menu */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={user.image}
                      name={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 text-sm"
                      classNames={{
                        base: "bg-gradient-to-br from-blue-500 to-purple-500",
                        name: "text-white font-semibold",
                      }}
                    />
                    <IconChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="profile"
                  startContent={<IconUser className="w-4 h-4" />}
                  href="/profile"
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="theme"
                  startContent={
                    theme === "dark" ? (
                      <IconSun className="w-4 h-4" />
                    ) : (
                      <IconMoon className="w-4 h-4" />
                    )
                  }
                  endContent={
                    <Switch
                      size="sm"
                      isSelected={theme === "dark"}
                      onValueChange={toggleTheme}
                    />
                  }
                  isReadOnly
                >
                  Dark Mode
                </DropdownItem>
                <DropdownItem key="divider1" isReadOnly className="opacity-100">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  startContent={<IconLogout className="w-4 h-4" />}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogoutButton
                    variant="light"
                    className="w-full justify-start"
                    showIcon={false}
                  />
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
