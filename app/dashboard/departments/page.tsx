"use client";

import { useState } from "react";
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
  Input,
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Tooltip,
  addToast,
} from "@heroui/react";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconPalette,
  IconCode,
  IconCheck,
} from "@tabler/icons-react";
import { useFetch } from "@/hooks/use-fetch";
import IconPicker from "@/components/icon-picker";
import { useMutate } from "@/hooks/use-mutate";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  budget?: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentsResponse {
  success: boolean;
  data: {
    departments: Department[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(
    null
  );
  const { mutateAsync, isPending } = useMutate({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    budget: "",
    color: "#3b82f6",
    icon: "",
    isActive: true,
  });

  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch departments
  const { refetch: refetchDepartments, isLoading } =
    useFetch<DepartmentsResponse>({
      queryKey: ["departments", pagination.page, search],
      endPoint: "departments/paginate",
      getUrlParams: () => ({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
      }),
      onError: (error) => {
        addToast({ title: error.message || "Failed to fetch departments" });
      },
      afterFetch: (data) => {
        if (data?.success) {
          setDepartments(data.data.departments);
          setPagination(data.data.pagination);
        }
      },
    });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      code: "",
      description: "",
      budget: "",
      color: "#3b82f6",
      icon: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (department: Department) => {
    if (!isAdmin) return;

    setModalMode("edit");
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      budget: department.budget?.toString() || "",
      color: department.color || "#3b82f6",
      icon: department.icon || "",
      isActive: department.isActive,
    });
    setShowModal(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    if (!isAdmin) return;

    setDepartmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast({ title: "Department name is required", color: "danger" });
      return;
    }

    if (!formData.code.trim()) {
      addToast({ title: "Department code is required", color: "danger" });
      return;
    }

    try {
      const url =
        modalMode === "edit" && selectedDepartment
          ? `/departments/department/${selectedDepartment.id}`
          : "/departments";

      const method = modalMode === "edit" ? "PUT" : "POST";

      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      const response = await mutateAsync({
        method,
        endPoint: url,
        variables: payload,
      });

      if (response?.error) {
        if (typeof response?.error === "string") {
          throw new Error(response.error);
        } else {
          throw response.error;
        }
      }

      if (response.message) {
        addToast({ title: response.message });
        setShowModal(false);
        refetchDepartments();

        // Reset form
        setFormData({
          name: "",
          code: "",
          description: "",
          budget: "",
          color: "#3b82f6",
          icon: "",
          isActive: true,
        });
        setSelectedDepartment(null);
      } else {
        addToast({
          title: response.error || "Failed to save department",
          color: "danger",
        });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to save department",
        color: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (!departmentToDelete || !isAdmin) return;

    try {
      const response = await mutateAsync({
        method: "DELETE",
        endPoint: `/departments/department/${departmentToDelete}`,
      });

      if (response?.error) {
        if (typeof response?.error === "string") {
          throw new Error(response.error);
        } else {
          throw response.error;
        }
      }

      if (response.message) {
        addToast({ title: response.message });
        refetchDepartments();
      } else {
        addToast({
          title: response?.error || "An error occurred",
          color: "danger",
        });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to delete department",
        color: "danger",
      });
    } finally {
      setDeleteModalOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Departments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage organizational departments
          </p>
        </div>
        {isAdmin && (
          <Button
            color="primary"
            startContent={<IconPlus className="w-4 h-4" />}
            onPress={handleOpenCreateModal}
          >
            Add Department
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search departments by name, code, or description..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                onPress={() => refetchDepartments()}
                startContent={<IconBuilding className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table
              aria-label="Departments table"
              removeWrapper
              classNames={{
                base: "min-w-full",
                th: "px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800",
                td: "px-4 py-3 whitespace-nowrap",
                tr: "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
              }}
              bottomContent={
                <div className="flex w-full justify-center py-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={handlePageChange}
                    size="sm"
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn className="w-15">COLOR</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn className="w-25">CODE</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn className="w-30">BUDGET</TableColumn>
                <TableColumn className="w-25">STATUS</TableColumn>
                <TableColumn className="w-30">CREATED</TableColumn>
                {isAdmin ? (
                  <TableColumn className="w-25 text-right">ACTIONS</TableColumn>
                ) : (
                  <TableColumn>
                    <></>
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody emptyContent="No departments found">
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div
                        className="w-8 h-8 rounded-full border"
                        style={{
                          backgroundColor: department.color || "#3b82f6",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{department.name}</div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {department.code}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {department.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {department.budget
                          ? formatCurrency(department.budget)
                          : "No budget"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={department.isActive ? "success" : "danger"}
                        variant="flat"
                      >
                        {department.isActive ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(department.createdAt)}
                      </div>
                    </TableCell>
                    {isAdmin ? (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Edit">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleOpenEditModal(department)}
                            >
                              <IconEdit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() =>
                                handleOpenDeleteModal(department.id)
                              }
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    ) : (
                      <></>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onOpenChange={setShowModal}
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          <ModalHeader>
            {modalMode === "create"
              ? "Create New Department"
              : "Edit Department"}
          </ModalHeader>
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Department Name"
                  placeholder="Enter department name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                />

                <Input
                  label="Department Code"
                  placeholder="e.g., HR, IT, FIN"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  isRequired
                  startContent={<IconCode className="w-4 h-4 text-gray-400" />}
                />

                <Textarea
                  label="Description (Optional)"
                  placeholder="Enter department description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <Input
                  label="Budget (Optional)"
                  type="number"
                  placeholder="0.00"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-gray-500">UGX</span>
                    </div>
                  }
                />

                {/* Color Picker Section */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm shrink-0"
                      style={{ backgroundColor: formData.color }}
                    />
                    <div className="flex-1">
                      <Input
                        value={formData.color}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setFormData({ ...formData, color: newColor });
                        }}
                        placeholder="#3b82f6"
                        startContent={
                          <IconPalette className="w-4 h-4 text-gray-400" />
                        }
                        description="Enter hex color code (e.g., #3b82f6)"
                      />
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Quick Colors:
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "#3b82f6", // Blue
                        "#ef4444", // Red
                        "#10b981", // Green
                        "#f59e0b", // Yellow
                        "#8b5cf6", // Purple
                        "#ec4899", // Pink
                        "#06b6d4", // Cyan
                        "#84cc16", // Lime
                        "#f97316", // Orange
                        "#6366f1", // Indigo
                        "#64748b", // Gray
                        "#14b8a6", // Teal
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color
                              ? "border-gray-900 dark:border-white scale-110 ring-2 ring-offset-1 ring-gray-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                          title={color}
                        >
                          {formData.color === color && (
                            <div className="flex items-center justify-center w-full h-full">
                              <IconCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <IconPicker
                  value={formData.icon}
                  onChange={(iconName) =>
                    setFormData({ ...formData, icon: iconName })
                  }
                  label="Icon"
                  placeholder="Select an icon for this department..."
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isPending}>
                {modalMode === "create"
                  ? "Create Department"
                  : "Update Department"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Delete Department</ModalHeader>
          <ModalBody>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this department? This action
              cannot be undone.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Any expenses or users assigned to this department will need to be
              reassigned.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
