"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@heroui/react";
import { UserRole } from "@prisma/client";

interface WithAuthProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function WithAuth({
  children,
  requiredRole,
  redirectTo = "/unauthorized",
}: WithAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (!session) {
      router.push("/auth/login");
      return;
    }

    // If role is required but user doesn't have it
    if (requiredRole) {
      const userRole = session.user.role;
      if (!userRole) {
        router.push(redirectTo);
      } else {
        const hasRole = Array.isArray(requiredRole)
          ? requiredRole.includes(userRole)
          : userRole === requiredRole;

        if (!hasRole) {
          router.push(redirectTo);
        }
      }
    }
  }, [session, status, router, requiredRole, redirectTo]);

  // Show loading spinner while checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If no session but not loading (redirecting), show nothing
  if (!session) {
    return null;
  }

  // If role check failed (redirecting), show nothing
  if (requiredRole) {
    const userRole = session.user.role;
    if (!userRole) {
      return null;
    } else {
      const hasRole = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;

      if (!hasRole) {
        return null;
      }
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
