"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconSearch,
  IconChevronDown,
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconPlus,
  IconX,
  IconReceipt,
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
  Spinner,
} from "@heroui/react";
import { LogoutButton } from "./logout-button";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { useLazyFetch } from "@/hooks/use-fetch";
import { Expense, ExpensesResponse } from "@/app/dashboard/expenses/types";

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
  const [suggestions, setSuggestions] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { getDataAsync } = useLazyFetch<ExpensesResponse>({
    endPoint: "expenses",
  });

  // Debounced search function
  const searchExpenses = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getDataAsync({
          endPoint: `/expenses`,
          params: {
            limit: "5",
            search: query,
          },
        });
        if (response.error) {
          setSuggestions([]);
        } else {
          setSuggestions(response.data.expenses || []);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle search query changes
  useEffect(() => {
    searchExpenses(searchQuery);
    return () => {
      searchExpenses.cancel();
    };
  }, [searchQuery, searchExpenses]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to expenses page with search query
      router.push(
        `/dashboard/expenses?search=${encodeURIComponent(searchQuery)}`
      );
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (expense: Expense) => {
    router.push(`/dashboard/expenses/${expense.id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else if (searchQuery.trim()) {
          handleSearch(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* First row: Title and User */}
          <div className="flex items-center justify-between mt-10 lg:mt-0">
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
          <div className="flex items-center gap-3" ref={searchRef}>
            {/* Search with suggestions */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Search expenses description, or category..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  startContent={
                    <IconSearch className="w-4 h-4 text-gray-400" />
                  }
                  endContent={
                    searchQuery && (
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="h-4 w-4 min-w-4"
                        onPress={clearSearch}
                      >
                        <IconX className="w-3 h-3" />
                      </Button>
                    )
                  }
                  classNames={{
                    input: "text-sm",
                    inputWrapper:
                      "h-10 bg-gray-100 dark:bg-gray-800 border-none",
                  }}
                  size="sm"
                />
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <Spinner size="sm" />
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((expense, index) => (
                        <button
                          key={expense.id}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-start gap-3 ${
                            index === selectedSuggestionIndex
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }`}
                          onClick={() => handleSuggestionClick(expense)}
                        >
                          <IconReceipt className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {expense.description}
                              </p>
                              <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                ${expense.amount.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                {expense?.category?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2">
                        <button
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={handleSearch}
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No expenses found
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <Button
              color="primary"
              size="sm"
              startContent={<IconPlus className="w-4 h-4" />}
              className="whitespace-nowrap shrink-0"
              onPress={() => {
                router.push("/dashboard/expenses");
              }}
            >
              Add Expense
            </Button>
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
          </div>

          {/* Right side - Actions and user menu */}
          <div
            className="flex items-center gap-3 w-full sm:w-auto"
            ref={searchRef}
          >
            {/* Search with suggestions */}
            <div className="flex-1 sm:flex-none sm:max-w-lg relative">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Search expenses by title, description, or category..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  startContent={
                    <IconSearch className="w-4 h-4 text-gray-400" />
                  }
                  endContent={
                    searchQuery && (
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="h-4 w-4 min-w-4"
                        onPress={clearSearch}
                      >
                        <IconX className="w-3 h-3" />
                      </Button>
                    )
                  }
                  classNames={{
                    input: "text-sm",
                    inputWrapper:
                      "h-10 bg-gray-100 dark:bg-gray-800 border-none",
                  }}
                  size="sm"
                />
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <Spinner size="sm" />
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((expense, index) => (
                        <button
                          key={expense.id}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-start gap-3 ${
                            index === selectedSuggestionIndex
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }`}
                          onClick={() => handleSuggestionClick(expense)}
                        >
                          <IconReceipt className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {expense.description}
                              </p>
                              <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                UGX {expense.amount.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {expense.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                {expense.category?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2">
                        <button
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={handleSearch}
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No expenses found
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Add Expense Button */}
            <Button
              color="primary"
              size="sm"
              startContent={<IconPlus className="w-4 h-4" />}
              className="whitespace-nowrap"
              onPress={() => {
                router.push("/dashboard/expenses");
              }}
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
