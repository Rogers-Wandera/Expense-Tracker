"use client";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./auth-provider";
import { Session } from "next-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { makeQueryClient } from "../get-query-client";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const queryClient = makeQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider session={session}>
        <HeroUIProvider>{children}</HeroUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
