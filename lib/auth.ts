import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  session: {
    strategy: "database", // using database for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Custom pages
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/register",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if user exists
        if (!user) {
          return null;
        }

        // Check if account is locked
        if (user.isLocked) {
          throw new Error("Account is locked");
        }

        // Verify password
        const isValidPassword = await compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        // Update last login date
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginDate: new Date() },
        });

        // Return user object (exclude password)
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          image: (user?.imageUrl as any)?.url,
        };
      },
    }),
  ],

  // Callbacks for session management
  callbacks: {
    async session({ session, user, token }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token?.id || user?.id;
        session.user.firstName = token?.firstName || user?.firstName;
        session.user.lastName = token?.lastName || user?.lastName;
        session.user.isVerified = token?.isVerified || user?.isVerified;
      }
      return session;
    },

    async jwt({ token, user }) {
      // Add user info to JWT
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isVerified = user.isVerified;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + "/dashboard";
    },
  },

  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `__Secure-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};
