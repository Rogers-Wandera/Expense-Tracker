import { UserRole } from "@/generated/prisma";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      role?: UserRole;
      isVerified: boolean;
      image?: string;
    };
  }

  interface User {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: UserRole;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: UserRole;
    isVerified: boolean;
  }
}
