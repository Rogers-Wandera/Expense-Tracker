"use client";

import { useState, useMemo } from "react";
import {
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@heroui/react";
import * as Icons from "@tabler/icons-react";
import { IconSearch, IconX, IconCheck } from "@tabler/icons-react";

const POPULAR_ICONS = [
  "IconBuilding", // Department
  "IconCategory", // Category
  "IconUser", // User
  "IconUsers", // Users
  "IconWallet", // Finance
  "IconCreditCard", // Payment
  "IconReceipt", // Receipt
  "IconChartBar", // Statistics
  "IconSettings", // Settings
  "IconHome", // Home
  "IconCar", // Transport
  "IconPlane", // Travel
  "IconMedicalCross", // Medical
  "IconTools", // Tools
  "IconDeviceDesktop", // IT
  "IconShoppingCart", // Shopping
  "IconCoffee", // Food/Drinks
  "IconBuildingStore", // Store
  "IconPhone", // Communication
  "IconMail", // Email
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  placeholder?: string;
}

export default function IconPicker({
  value,
  onChange,
  label = "Icon",
  placeholder = "Select an icon...",
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Get all available icon names from Tabler Icons
  const allIconNames = Object.keys(Icons).filter(
    (key) => key.startsWith("Icon") && key !== "Icon"
  );

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    const iconList = showAll ? allIconNames : POPULAR_ICONS;

    if (!search.trim()) {
      return iconList.slice(0, showAll ? 50 : POPULAR_ICONS.length);
    }

    return iconList
      .filter((iconName) =>
        iconName
          .toLowerCase()
          .includes(search.toLowerCase().replace("icon", ""))
      )
      .slice(0, 50);
  }, [search, showAll, allIconNames]);

  // Get the icon component from the name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
  };

  const selectedIconComponent = value ? getIconComponent(value) : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
          <PopoverTrigger>
            <Button
              variant="flat"
              className="justify-start flex-1 h-12"
              startContent={
                selectedIconComponent || (
                  <div className="w-5 h-5 text-gray-400">
                    <IconSearch />
                  </div>
                )
              }
            >
              <span className="truncate">
                {value
                  ? value
                      .replace("Icon", "")
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                  : placeholder}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0">
            <div className="p-3">
              {/* Search Input */}
              <div className="mb-3">
                <Input
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  startContent={
                    <IconSearch className="w-4 h-4 text-gray-400" />
                  }
                  size="sm"
                />
              </div>

              {/* Toggle between popular and all icons */}
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant={!showAll ? "solid" : "flat"}
                  color={!showAll ? "primary" : "default"}
                  onPress={() => setShowAll(false)}
                  className="flex-1"
                >
                  Popular
                </Button>
                <Button
                  size="sm"
                  variant={showAll ? "solid" : "flat"}
                  color={showAll ? "primary" : "default"}
                  onPress={() => setShowAll(true)}
                  className="flex-1"
                >
                  All Icons
                </Button>
              </div>

              {/* Icons Grid */}
              <div className="grid grid-cols-6 gap-2 max-h-75 overflow-y-auto p-1">
                {filteredIcons.length > 0 ? (
                  filteredIcons.map((iconName) => {
                    const IconComponent = getIconComponent(iconName);
                    const isSelected = value === iconName;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary-100 dark:bg-primary-900 border-2 border-primary-500"
                            : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleSelectIcon(iconName)}
                        title={iconName
                          .replace("Icon", "")
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {IconComponent && (
                            <div
                              className={
                                isSelected
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }
                            >
                              {IconComponent}
                            </div>
                          )}
                          {isSelected && (
                            <IconCheck className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-6 text-center py-8 text-gray-500">
                    No icons found
                  </div>
                )}
              </div>

              {/* Clear Selection */}
              {value && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={<IconX className="w-4 h-4" />}
                    onPress={handleClear}
                    className="w-full"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear button when an icon is selected */}
        {value && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={handleClear}
          >
            <IconX className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500">
        {value
          ? `Selected: ${value
              .replace("Icon", "")
              .replace(/([A-Z])/g, " $1")
              .trim()}`
          : "Choose an icon to represent this item"}
      </p>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center rounded bg-primary-100 dark:bg-primary-900">
            {selectedIconComponent && (
              <div className="text-primary-600 dark:text-primary-400">
                {selectedIconComponent}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Preview</p>
            <p className="text-xs text-gray-500">
              How it will appear in the UI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
