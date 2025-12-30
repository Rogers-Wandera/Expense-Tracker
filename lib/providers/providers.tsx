"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { AuthProvider } from "./auth-provider";
import { Session } from "next-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { makeQueryClient } from "../get-query-client";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "./theme-provider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const queryClient = makeQueryClient();
  const router = useRouter();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider session={session}>
          <HeroUIProvider navigate={router.push}>
            <ToastProvider />
            {children}
          </HeroUIProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
