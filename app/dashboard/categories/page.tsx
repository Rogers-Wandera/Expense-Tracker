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
  IconCategory,
  IconPalette,
  IconCheck,
} from "@tabler/icons-react";
import { useFetch } from "@/hooks/use-fetch";
import IconPicker from "@/components/icon-picker";
import { useMutate } from "@/hooks/use-mutate";

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
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

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { mutateAsync, isPending } = useMutate({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6", // Default blue color
    icon: "",
    isActive: true,
  });

  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch categories
  const { refetch: refetchCategories, isLoading } =
    useFetch<CategoriesResponse>({
      queryKey: ["categories", pagination.page, search],
      endPoint: "categories/paginate",
      getUrlParams: () => ({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
      }),
      onError: (error) => {
        addToast({ title: error.message || "Failed to fetch categories" });
      },
      afterFetch: (data) => {
        if (data?.success) {
          setCategories(data.data.categories);
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
      description: "",
      color: "#3b82f6",
      icon: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (category: Category) => {
    if (!isAdmin) return;

    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3b82f6",
      icon: category.icon || "",
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    if (!isAdmin) return;

    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast({ title: "Category name is required", color: "danger" });
      return;
    }

    try {
      const url =
        modalMode === "edit" && selectedCategory
          ? `/categories/category/${selectedCategory.id}`
          : "/categories";

      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await mutateAsync({
        method,
        endPoint: url,
        variables: formData,
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
        refetchCategories();

        // Reset form
        setFormData({
          name: "",
          description: "",
          color: "#3b82f6",
          icon: "",
          isActive: true,
        });
        setSelectedCategory(null);
      } else {
        addToast({
          title: response.error || "Failed to save category",
          color: "danger",
        });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to save category",
        color: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !isAdmin) return;

    try {
      const response = await mutateAsync({
        method: "DELETE",
        endPoint: `/categories/category/${categoryToDelete}`,
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
        refetchCategories();
      } else {
        addToast({
          title: response?.error || "An error occurred",
          color: "danger",
        });
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to delete category",
        color: "danger",
      });
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage expense categories
          </p>
        </div>
        {isAdmin && (
          <Button
            color="primary"
            startContent={<IconPlus className="w-4 h-4" />}
            onPress={handleOpenCreateModal}
          >
            Add Category
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search categories by name or description..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                onPress={() => refetchCategories()}
                startContent={<IconCategory className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table
              aria-label="Categories table"
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
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn className="w-25">STATUS</TableColumn>
                <TableColumn className="w-30">CREATED</TableColumn>
                {isAdmin ? (
                  <TableColumn className="w-25 text-right">ACTIONS</TableColumn>
                ) : (
                  <></>
                )}
              </TableHeader>
              <TableBody emptyContent="No categories found">
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: category.color || "#3b82f6" }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={category.isActive ? "success" : "danger"}
                        variant="flat"
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(category.createdAt)}
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
                              onPress={() => handleOpenEditModal(category)}
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
                              onPress={() => handleOpenDeleteModal(category.id)}
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
        size="xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          <ModalHeader>
            {modalMode === "create" ? "Create New Category" : "Edit Category"}
          </ModalHeader>
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Category Name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                />

                <Textarea
                  label="Description (Optional)"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                  placeholder="Select an icon for this category..."
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isPending}>
                {modalMode === "create" ? "Create Category" : "Update Category"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Delete Category</ModalHeader>
          <ModalBody>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Any expenses using this category will need to be reassigned.
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
