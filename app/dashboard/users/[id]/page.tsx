"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Avatar,
  Chip,
  Badge,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
  ModalFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconUser,
  IconMail,
  IconShield,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconToggleLeft,
  IconToggleRight,
  IconLock,
  IconLockOpen,
  IconActivity,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useFetch } from "@/hooks/use-fetch";
import { User } from "../types";

interface UserDetailsResponse {
  success: boolean;
  data: User;
}

export default function UserDetailsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const userId = params.id as string;
  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch user details
  const { data: userResponse, isLoading: userLoading } =
    useFetch<UserDetailsResponse>({
      queryKey: ["user", userId],
      endPoint: `users/${userId}`,
      onError: (error) => {
        addToast({ title: error.message || "Failed to fetch user details" });
      },
    });

  useEffect(() => {
    if (userResponse?.data) {
      setUser(userResponse.data);
      setLoading(false);
    }
  }, [userResponse]);

  const handleBack = () => {
    router.push("/dashboard/users");
  };

  const handleEdit = () => {
    if (user && isAdmin) {
      router.push(`/dashboard/users/edit/${user.id}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !isAdmin) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const result = await response.json();

      if (result.success) {
        addToast({ title: result.message });
        router.push("/dashboard/users");
      } else {
        addToast({ title: result?.error || "An error occurred" });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to delete user" });
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleUpdateStatus = async (action: string, value: boolean) => {
    if (!user || !isAdmin) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const result = await response.json();

      if (result.success) {
        addToast({ title: result.message });
        // Refresh user data
        setUser(result.data);
      } else {
        addToast({ title: result.error });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to update user status" });
    }
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MANAGER":
        return "warning";
      case "STAFF":
        return "primary";
      case "VIEWER":
        return "default";
      default:
        return "default";
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The user you're looking for doesn't exist or has been deleted.
            </p>
            <Button
              className="mt-4"
              startContent={<IconArrowLeft className="w-4 h-4" />}
              onPress={handleBack}
            >
              Back to Users
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Only ADMIN can view user details
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view user details.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Only administrators can view user details.
            </p>
            <Button
              className="mt-4"
              startContent={<IconArrowLeft className="w-4 h-4" />}
              onPress={handleBack}
            >
              Back to Users
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            startContent={<IconArrowLeft className="w-4 h-4" />}
            onPress={handleBack}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage user information
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              startContent={<IconEdit className="w-4 h-4" />}
              onPress={handleEdit}
            >
              Edit User
            </Button>
            <Button
              color="danger"
              variant="flat"
              startContent={<IconTrash className="w-4 h-4" />}
              onPress={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardBody className="text-center">
              <Avatar
                size="lg"
                name={getUserInitials(user.firstName, user.lastName)}
                src={user.imageUrl || undefined}
                className="w-32 h-32 text-3xl mx-auto mb-4"
              />
              <h2 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <IconMail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              <Divider className="my-4" />

              {/* Role Badge */}
              <div className="mb-4">
                <Chip
                  color={getRoleColor(user.role)}
                  variant="flat"
                  startContent={<IconShield className="w-4 h-4" />}
                  className="capitalize"
                >
                  {user.role}
                </Chip>
              </div>

              {/* Department */}
              {user.department && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <IconBuilding className="w-4 h-4 text-gray-400" />
                    <span>{user.department.name}</span>
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    color={user.isActive ? "success" : "danger"}
                    variant="flat"
                    className="border-none"
                  >
                    <div className="flex items-center gap-1">
                      {user.isActive ? (
                        <IconToggleRight className="w-4 h-4" />
                      ) : (
                        <IconToggleLeft className="w-4 h-4" />
                      )}
                      <span>{user.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </Badge>

                  {user.isLocked && (
                    <Badge
                      color="warning"
                      variant="flat"
                      className="border-none"
                    >
                      <div className="flex items-center gap-1">
                        <IconLock className="w-4 h-4" />
                        <span>Locked</span>
                      </div>
                    </Badge>
                  )}
                </div>

                {!user.isVerified && (
                  <Badge color="default" variant="flat" className="border-none">
                    <div className="flex items-center gap-1">
                      <IconClock className="w-4 h-4" />
                      <span>Unverified</span>
                    </div>
                  </Badge>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          {isAdmin && (
            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    fullWidth
                    variant="flat"
                    color={user.isActive ? "warning" : "success"}
                    startContent={
                      user.isActive ? (
                        <IconToggleLeft className="w-4 h-4" />
                      ) : (
                        <IconToggleRight className="w-4 h-4" />
                      )
                    }
                    onPress={() =>
                      handleUpdateStatus("activate", !user.isActive)
                    }
                  >
                    {user.isActive ? "Deactivate User" : "Activate User"}
                  </Button>

                  <Button
                    fullWidth
                    variant="flat"
                    color={user.isLocked ? "success" : "warning"}
                    startContent={
                      user.isLocked ? (
                        <IconLockOpen className="w-4 h-4" />
                      ) : (
                        <IconLock className="w-4 h-4" />
                      )
                    }
                    onPress={() => handleUpdateStatus("lock", !user.isLocked)}
                  >
                    {user.isLocked ? "Unlock Account" : "Lock Account"}
                  </Button>

                  {!user.isVerified && (
                    <Button
                      fullWidth
                      variant="flat"
                      color="success"
                      startContent={<IconCheck className="w-4 h-4" />}
                      onPress={() => handleUpdateStatus("verify", true)}
                    >
                      Mark as Verified
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - User Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs aria-label="User details">
            <Tab
              key="overview"
              title={
                <div className="flex items-center gap-2">
                  <IconUser className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">First Name</p>
                          <p className="font-medium">{user.firstName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Name</p>
                          <p className="font-medium">{user.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium">{user.role}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Account Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Created
                          </p>
                          <p className="font-medium">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">
                            {user.updatedAt
                              ? formatDate(user.updatedAt)
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Login</p>
                          <p className="font-medium">
                            {user.lastLoginDate
                              ? formatDate(user.lastLoginDate)
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Status
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                user.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <p className="font-medium">
                              {user.isActive ? "Active" : "Inactive"}
                              {user.isLocked && " (Locked)"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Department Information */}
                    {user.department && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Department Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium">
                              {user.department.name}
                            </p>
                          </div>
                          {user.department.color && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Department Color
                              </p>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full border"
                                  style={{
                                    backgroundColor: user.department.color,
                                  }}
                                />
                                <p className="font-medium">
                                  {user.department.color}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="activity"
              title={
                <div className="flex items-center gap-2">
                  <IconActivity className="w-4 h-4" />
                  <span>Activity Log</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <p className="text-gray-500 text-center py-4">
                    Activity log feature coming soon
                  </p>
                  {/* You can implement activity log here */}
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="audit"
              title={
                <div className="flex items-center gap-2">
                  <IconClock className="w-4 h-4" />
                  <span>Audit Trail</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Audit Information</h3>
                    <Table removeWrapper>
                      <TableHeader>
                        <TableColumn>ACTION</TableColumn>
                        <TableColumn>BY</TableColumn>
                        <TableColumn>DATE</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {user.createdByUser ? (
                          <TableRow>
                            <TableCell>Created</TableCell>
                            <TableCell>
                              {user.createdByUser.firstName}{" "}
                              {user.createdByUser.lastName}
                              <p className="text-xs text-gray-500">
                                {user.createdByUser.email}
                              </p>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                        {user.updatedByUser ? (
                          <TableRow>
                            <TableCell>Last Updated</TableCell>
                            <TableCell>
                              {user.updatedByUser.firstName}{" "}
                              {user.updatedByUser.lastName}
                              <p className="text-xs text-gray-500">
                                {user.updatedByUser.email}
                              </p>
                            </TableCell>
                            <TableCell>{formatDate(user.updatedAt)}</TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Confirm User Deletion</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete{" "}
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                ?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                  ⚠️ Important Note:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                  <li className="flex items-start gap-2">
                    <IconX className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      This is a soft delete - the user will be marked as deleted
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconX className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      The user account will be deactivated immediately
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>This action can be reversed by an administrator</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                The user will no longer be able to access the system.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
