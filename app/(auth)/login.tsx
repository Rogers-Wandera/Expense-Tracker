"use client";

import { useState } from "react";

import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Checkbox,
  Link as HeroLink,
} from "@heroui/react";
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconArrowRight,
  IconBrandGithub,
  IconBrandChrome,
} from "@tabler/icons-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="max-w-md mx-auto border-none shadow-2xl dark:bg-gray-900/50">
      <CardHeader className="flex flex-col items-start pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue to your dashboard
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="space-y-6">
        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="bordered"
            className="h-12"
            startContent={<IconBrandChrome className="w-5 h-5" />}
          >
            Google
          </Button>
          <Button
            variant="bordered"
            className="h-12"
            startContent={<IconBrandGithub className="w-5 h-5" />}
          >
            GitHub
          </Button>
        </div>

        <div className="relative">
          <Divider />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-white dark:bg-gray-900 text-sm text-gray-500">
            Or continue with
          </span>
        </div>

        {/* Email/Password Form */}
        <form className="space-y-5">
          <Input
            type="email"
            label="Email address"
            placeholder="name@company.com"
            variant="bordered"
            size="lg"
            startContent={<IconMail className="w-5 h-5 text-gray-400" />}
            className="w-full"
          />

          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            variant="bordered"
            size="lg"
            startContent={<IconLock className="w-5 h-5 text-gray-400" />}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <IconEyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <IconEye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            }
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <Checkbox defaultSelected>Remember me</Checkbox>
            <HeroLink href="/forgot-password" className="text-sm text-blue-600">
              Forgot password?
            </HeroLink>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold"
            isLoading={isLoading}
            endContent={<IconArrowRight className="w-4 h-4" />}
          >
            Sign in
          </Button>
        </form>
      </CardBody>

      <CardFooter className="flex flex-col space-y-4 pt-4">
        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
          </span>
          <HeroLink href="/register" className="font-semibold text-blue-600">
            Get started
          </HeroLink>
        </div>

        <div className="text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <HeroLink href="/terms" className="text-xs">
            Terms of Service
          </HeroLink>{" "}
          and{" "}
          <HeroLink href="/privacy" className="text-xs">
            Privacy Policy
          </HeroLink>
        </div>
      </CardFooter>
    </Card>
  );
}
