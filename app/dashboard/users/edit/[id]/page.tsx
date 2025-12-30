"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardBody, Spinner, addToast } from "@heroui/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useFetch } from "@/hooks/use-fetch";
import { UserForm } from "@/components/users/form";

interface UserDetailsResponse {
  success: boolean;
  data: any;
}

interface Department {
  id: string;
  name: string;
  color?: string;
}

export default function EditUserPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const userId = params.id as string;
  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch user details for editing
  const { data: userResponse, isLoading: userLoading } =
    useFetch<UserDetailsResponse>({
      queryKey: ["user", userId],
      endPoint: `users/${userId}`,
      onError: (error) => {
        addToast({ title: error.message || "Failed to fetch user details" });
      },
    });

  // Fetch departments for the form
  const { data: departmentsData, isLoading: departmentsLoading } = useFetch<{
    success: boolean;
    departments: Department[];
  }>({
    queryKey: ["departments"],
    endPoint: "departments",
  });

  useEffect(() => {
    if (userResponse?.data) {
      setUser(userResponse.data);
      setLoading(false);
    }
  }, [userResponse]);

  const handleBack = () => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleSuccess = () => {
    addToast({ title: "User updated successfully" });
    router.push(`/dashboard/users/${userId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/users/${userId}`);
  };

  if (loading || userLoading || departmentsLoading) {
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
              The user you're trying to edit doesn't exist.
            </p>
            <Button
              className="mt-4"
              startContent={<IconArrowLeft className="w-4 h-4" />}
              onPress={() => router.push("/dashboard/users")}
            >
              Back to Users
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Only ADMIN can edit users
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to edit users.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Only administrators can edit user details.
            </p>
            <Button
              className="mt-4"
              startContent={<IconArrowLeft className="w-4 h-4" />}
              onPress={handleBack}
            >
              Back to User Details
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const departments = departmentsData?.departments || [];

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
              Edit User
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Edit user information for {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* User Form */}
      <Card>
        <CardBody>
          <UserForm
            user={user}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            departments={departments}
          />
        </CardBody>
      </Card>
    </div>
  );
}
