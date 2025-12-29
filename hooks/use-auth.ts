"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export interface AuthState {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    image?: string;
  } | null;
  isLoading: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const authState = useMemo((): AuthState => {
    if (status === "loading") {
      return {
        user: null,
        isLoading: true,
      };
    }

    if (!session?.user) {
      return {
        user: null,
        isLoading: false,
      };
    }

    // Extract custom properties from session
    const customUser = session.user as any;

    return {
      user: {
        id: session.user.id,
        email: session.user.email || "",
        firstName: customUser.firstName || "",
        lastName: customUser.lastName || "",
        isVerified: customUser.isVerified || false,
        image: session.user.image || undefined,
      }, // Add tenant logic if needed
      isLoading: false,
    };
  }, [session, status]);

  return authState;
}
