"use client";

import { useState, useEffect, useCallback } from "react";
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
import { ExpenseForm } from "@/components/expenses/expense-form";
import ExpenseTable from "./table";
import ExpenseFilters from "./filters";
import { Expense, PaginationData } from "./types";
import ExpenseStats from "./stats";
import { useFetch } from "@/hooks/use-fetch";
import { useMutate } from "@/hooks/use-mutate";
import { useSearchParams } from "next/navigation";

interface ApiExpensesResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    pagination: PaginationData;
    summary: {
      totalAmount: number;
      totalCount: number;
      averageAmount: number;
    };
  };
}

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { mutateAsync } = useMutate({});
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    categoryId: "all",
    departmentId: "all",
    startDate: "",
    endDate: "",
    search: "",
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

  const queryKey = [
    "expenses",
    pagination.page,
    ...Object.values(filters),
    pagination.limit,
  ];

  const getUrlParams = useCallback(() => {
    const params: Record<string, string | number> = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.categoryId !== "all") {
      params.categoryId = filters.categoryId;
    }
    if (filters.departmentId !== "all") {
      params.departmentId = filters.departmentId;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    return params;
  }, [pagination.page, pagination.limit, filters]);

  // Fetch expenses using useFetch hook
  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    isError: expensesError,
    error: expensesFetchError,
    refetch: refetchExpenses,
  } = useFetch<ApiExpensesResponse>({
    queryKey,
    endPoint: "expenses",
    getUrlParams,
    onError: (error) => {
      addToast({ title: error.message || "Failed to fetch expenses" });
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useFetch<{
    success: boolean;
    categories: { id: string; name: string }[];
  }>({
    queryKey: ["categories"],
    endPoint: "categories",
  });

  // Fetch departments
  const { data: departmentsData, isLoading: departmentsLoading } = useFetch<{
    success: boolean;
    departments: { id: string; name: string }[];
  }>({
    queryKey: ["departments"],
    endPoint: "departments",
  });

  // Extract data from responses
  const expenses = expensesResponse?.data?.expenses || [];
  const summary = expensesResponse?.data?.summary || {
    totalAmount: 0,
    totalCount: 0,
    averageAmount: 0,
  };

  const categories = categoriesData?.categories || [];
  const departments = departmentsData?.departments || [];

  // Update pagination when data changes
  useEffect(() => {
    if (expensesResponse?.data?.pagination) {
      setPagination(expensesResponse.data.pagination);
    }
  }, [expensesResponse]);

  // Handle errors
  useEffect(() => {
    if (expensesError && expensesFetchError) {
      addToast({
        title: expensesFetchError.message || "Failed to load expenses",
      });
    }
  }, [expensesError, expensesFetchError]);

  const allDeps = [
    { key: "all", label: "All Departments" },
    ...departments.map((c) => ({
      key: c.id,
      label: c.name,
    })),
  ];

  const allCats = [
    { key: "all", label: "All Categories" },
    ...categories.map((c) => ({
      key: c.id,
      label: c.name,
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
      status: "all",
      categoryId: "all",
      departmentId: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await mutateAsync({
        method: "DELETE",
        endPoint: "/expenses/${expenseToDelete}",
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
        refetchExpenses(); // Refresh the list
      } else {
        addToast({ title: response?.error || "An error occurred" });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to delete expense" });
    } finally {
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await mutateAsync({
        method: "PATCH",
        endPoint: `/expenses/${id}`,
        variables: { status },
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
        refetchExpenses(); // Refresh the list
      } else {
        addToast({ title: response.error });
      }
    } catch (error: any) {
      addToast({ title: error.message || "Failed to update status" });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedExpense(null);
    refetchExpenses(); // Refresh the list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedExpense(null);
  };

  const handleRefresh = () => {
    refetchExpenses();
  };

  const loading = expensesLoading || categoriesLoading || departmentsLoading;

  useEffect(() => {
    if (search) {
      setFilters((prev) => ({
        ...prev,
        search: search,
      }));
    }
  }, [search]);

  if (loading && expenses.length === 0) {
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
            Expense Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all expenses in one place
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
            isDisabled={session?.user?.role === "VIEWER"}
          >
            {showForm ? "Cancel" : " Add Expense"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!showForm && <ExpenseStats summary={summary} expenses={expenses} />}

      {/* Search and Filters */}
      {!showForm && (
        <ExpenseFilters
          handleFilterChange={handleFilterChange}
          handleResetFilters={handleResetFilters}
          filters={filters}
          allCats={allCats}
          allDeps={allDeps}
          setShowAdvancedFilters={setShowAdvancedFilters}
          loading={expensesLoading}
          fetchExpenses={handleRefresh}
          showAdvancedFilters={showAdvancedFilters}
        />
      )}

      {/* Expense Form - Inline instead of modal */}
      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedExpense ? "Edit Expense" : "Create New Expense"}
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
            <ExpenseForm
              expense={selectedExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              categories={categories}
              departments={departments}
            />
          </CardBody>
        </Card>
      )}

      {/* Expenses Table */}
      {!showForm && (
        <ExpenseTable
          loading={expensesLoading}
          session={session}
          expenses={expenses}
          handleDeleteClick={handleDeleteClick}
          handleEdit={handleEdit}
          handleUpdateStatus={handleUpdateStatus}
          handlePageChange={handlePageChange}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this expense? This action cannot
              be undone.
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
