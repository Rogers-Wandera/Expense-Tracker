"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { IconLock, IconHome } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center space-y-6 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <IconLock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              as={Link}
              href="/dashboard"
              color="primary"
              className="w-full"
              startContent={<IconHome className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
            <Button
              as={Link}
              href="/login"
              variant="flat"
              className="w-full"
              onPress={() => signOut({ callbackUrl: "/auth/login" })}
            >
              Sign in with different account
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
