import { IServerErrorResponse } from "@/types/interfaces";
import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color palette
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  dark: "#1f2937",
  light: "#f9fafb",
};

export function isServerErrorResponse(
  error: any
): error is IServerErrorResponse {
  return (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    "message" in error &&
    "success" in error
  );
}

// Common error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to access this resource",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  SERVER_ERROR: "An internal server error occurred",
  VALIDATION_ERROR: "Validation failed",
  NETWORK_ERROR: "Network error. Please check your connection",
} as const;

export const normalizeError = (error: unknown): IServerErrorResponse => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (isServerErrorResponse(responseData)) {
      return responseData;
    }

    return {
      statusCode: error.response?.status || 500,
      path: error.config?.url || "/",
      timestamp: new Date().toISOString(),
      message:
        error.response?.data?.message || error.message || "An error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack || "" : "",
      success: false,
      error: error.code,
    };
  }

  if (isServerErrorResponse(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      path: "/",
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack || "" : "",
      success: false,
    };
  }

  return {
    statusCode: 500,
    path: "/",
    timestamp: new Date().toISOString(),
    message: typeof error === "string" ? error : "An unknown error occurred",
    stack: "",
    success: false,
  };
};
