"use client";

import { Toaster, toast } from "sonner";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showToast({
  message,
  type = "info",
  duration = 5000,
  action,
}: ToastProps) {
  const icons = {
    success: <IconCircleCheck className="w-4 h-4" />,
    error: <IconX className="w-4 h-4" />,
    warning: <IconAlertCircle className="w-4 h-4" />,
    info: <IconInfoCircle className="w-4 h-4" />,
  };

  toast[type](message, {
    duration,
    icon: icons[type],
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  });
}

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700",
        style: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      }}
    />
  );
}
