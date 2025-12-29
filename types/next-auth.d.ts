import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      isVerified: boolean;
      image?: string;
    };
  }

  interface User {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    isVerified: boolean;
  }
}
