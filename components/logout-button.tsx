"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { IconLogout, IconPower, IconLogout2 } from "@tabler/icons-react";
import { showToast } from "./error-toast";

interface LogoutButtonProps {
  /** Button variant */
  variant?: "light" | "flat" | "solid" | "bordered" | "ghost";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Redirect URL after logout */
  redirectTo?: string;
  /** Show confirmation modal */
  withConfirmation?: boolean;
  /** Button text */
  children?: React.ReactNode;
  /** Placement for dropdown variant */
  placement?: "top" | "bottom" | "left" | "right";
  /** Use dropdown menu */
  asDropdownItem?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

export function LogoutButton({
  variant = "light",
  size = "md",
  className = "",
  showIcon = true,
  redirectTo = "/",
  withConfirmation = false,
  children = "Logout",
  asDropdownItem = false,
  icon,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await signOut({
        redirect: false,
        callbackUrl: redirectTo,
      });

      showToast({
        message: "Logged out successfully",
        type: "success",
        duration: 3000,
      });

      // Force a refresh to clear session state
      router.refresh();

      // Redirect to login page
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout error:", error);

      showToast({
        message: "Failed to logout. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleClick = () => {
    if (withConfirmation) {
      onOpen();
    } else {
      handleLogout();
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    const icons = {
      sm: <IconLogout2 className="w-3 h-3" />,
      md: <IconLogout className="w-4 h-4" />,
      lg: <IconPower className="w-5 h-5" />,
    };

    return icons[size] || icons.md;
  };

  // If it's a dropdown item
  if (asDropdownItem) {
    return (
      <DropdownItem
        key="logout"
        startContent={showIcon ? getIcon() : undefined}
        className="text-danger"
        color="danger"
        onPress={handleClick}
      >
        {children}
      </DropdownItem>
    );
  }

  // Main button component
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onPress={handleClick}
        className={`${className} ${
          variant === "light" ? "text-gray-700 dark:text-gray-300" : ""
        }`}
        isLoading={isLoading}
        startContent={showIcon ? getIcon() : undefined}
        color={variant === "light" ? "default" : "danger"}
      >
        {children}
      </Button>

      {/* Confirmation Modal */}
      {withConfirmation && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          placement="center"
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <IconPower className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Confirm Logout</h3>
                      <p className="text-sm text-gray-500">
                        Are you sure you want to logout?
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">Note:</span> You will need
                      to sign in again to access your account.
                    </p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleLogout}
                    isLoading={isLoading}
                    startContent={<IconLogout className="w-4 h-4" />}
                  >
                    Yes, Logout
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
