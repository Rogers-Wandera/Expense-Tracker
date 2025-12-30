"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { IconPlus, IconX, IconCancel } from "@tabler/icons-react";
import { User, PaginationData, UsersResponse } from "./types";
import { useFetch } from "@/hooks/use-fetch";
import UserStats from "./stats";
import UserFilters from "./filters";
import { UserForm } from "@/components/users/form";
import UserTable from "./table";

export default function UsersPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    role: "all",
    departmentId: "all",
    search: "",
    isActive: "all",
  });

  // Pagination
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Build query key
  const queryKey = ["users", pagination.page, ...Object.values(filters)];

  // Fetch users using useFetch hook
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    error: usersFetchError,
    refetch: refetchUsers,
  } = useFetch<UsersResponse>({
    queryKey,
    endPoint: "users",
    getUrlParams: () => {
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.role !== "all") {
        params.role = filters.role;
      }
      if (filters.departmentId !== "all") {
        params.departmentId = filters.departmentId;
      }
      if (filters.isActive !== "all") {
        params.isActive = filters.isActive;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      return params;
    },
    manual: false,
    onError: (error) => {
      addToast({ title: error.message || "Failed to fetch users" });
    },
  });

  // Fetch departments for filters and form
  const { data: departmentsData, isLoading: departmentsLoading } = useFetch<{
    success: boolean;
    departments: { id: string; name: string; color?: string }[];
  }>({
    queryKey: ["departments"],
    endPoint: "/api/departments",
    manual: false,
  });

  // Extract data from responses
  const users = usersResponse?.data?.users || [];
  const summary = usersResponse?.data?.summary || {
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    roleDistribution: [],
  };

  const departments = departmentsData?.departments || [];

  // Update pagination when data changes
  useEffect(() => {
    if (usersResponse?.data?.pagination) {
      setPagination(usersResponse.data.pagination);
    }
  }, [usersResponse]);

  // Handle errors
  useEffect(() => {
    if (usersError && usersFetchError) {
      addToast({
        title: usersFetchError.message || "Failed to load users",
      });
    }
  }, [usersError, usersFetchError]);

  // Check if current user is ADMIN
  const isAdmin = session?.user?.role === "ADMIN";

  // Prepare filter options
  const allRoles = [
    { key: "all", label: "All Roles" },
    { key: "ADMIN", label: "Admin" },
    { key: "MANAGER", label: "Manager" },
    { key: "STAFF", label: "Staff" },
    { key: "VIEWER", label: "Viewer" },
  ];

  const allDeps = [
    { key: "all", label: "All Departments" },
    ...departments.map((dept) => ({
      key: dept.id,
      label: dept.name,
    })),
  ];

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      role: "all",
      departmentId: "all",
      search: "",
      isActive: "all",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEdit = (user: User) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!isAdmin) return;
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete || !isAdmin) return;

    try {
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const result = await response.json();

      if (result.success) {
        addToast({ title: result.message });
        refetchUsers(); // Refresh the list
      } else {
        addToast({ title: result?.error || "An error occurred" });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to delete user" });
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    action: string,
    value: boolean
  ) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
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
        refetchUsers(); // Refresh the list
      } else {
        addToast({ title: result.error });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to update user status" });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(null);
    refetchUsers(); // Refresh the list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    refetchUsers();
  };

  const loading = usersLoading || departmentsLoading;

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Only ADMIN can access user management
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access user management.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Only administrators can manage users.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system users and their permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color={showForm ? "danger" : "primary"}
            startContent={
              showForm ? (
                <IconCancel className="w-4 h-4" />
              ) : (
                <IconPlus className="w-4 h-4" />
              )
            }
            onPress={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : " Add User"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!showForm && <UserStats summary={summary} />}

      {/* Search and Filters */}
      {!showForm && (
        <UserFilters
          handleFilterChange={handleFilterChange}
          handleResetFilters={handleResetFilters}
          filters={filters}
          allRoles={allRoles}
          allDeps={allDeps}
          setShowAdvancedFilters={setShowAdvancedFilters}
          loading={usersLoading}
          fetchUsers={handleRefresh}
          showAdvancedFilters={showAdvancedFilters}
        />
      )}

      {/* User Form - Inline instead of modal */}
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedUser ? "Edit User" : "Create New User"}
              </h2>
              <Button
                size="sm"
                variant="light"
                onPress={handleFormCancel}
                isIconOnly
              >
                <IconX className="w-4 h-4" />
              </Button>
            </div>
            <UserForm
              user={selectedUser}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              departments={departments}
            />
          </CardBody>
        </Card>
      )}

      {/* Users Table */}
      {!showForm && (
        <UserTable
          loading={usersLoading}
          session={session}
          users={users}
          handleDeleteClick={handleDeleteClick}
          handleEdit={handleEdit}
          handleUpdateStatus={handleUpdateStatus}
          handlePageChange={handlePageChange}
          pagination={pagination}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this user? This action will:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
              <li>Soft delete the user (mark as deleted)</li>
              <li>Deactivate their account</li>
              <li>This action can be reversed by an admin</li>
            </ul>
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
