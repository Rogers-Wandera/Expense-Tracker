"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  Input,
  Card,
  CardBody,
  Chip,
  Tooltip,
  Spinner,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DatePicker,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
} from "@heroui/react";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrash,
  IconDownload,
  IconRefresh,
  IconChevronDown,
  IconCheck,
  IconX,
  IconClock,
  IconCurrencyDollar,
  IconCategory,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { parseDate } from "@internationalized/date";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  category?: { name: string; color: string };
  department?: { name: string; color: string };
  createdByUser?: { firstName: string; lastName: string; email: string };
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ExpensesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

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

  // Summary stats
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalCount: 0,
    averageAmount: 0,
  });

  // Data for filters
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.categoryId !== "all" && { categoryId: filters.categoryId }),
        ...(filters.departmentId !== "all" && {
          departmentId: filters.departmentId,
        }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/expenses?${params}`);
      const result = await response.json();

      if (response.ok) {
        setExpenses(result.data.expenses);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        addToast({ title: result?.error || "Failed to fetch expenses" });
      }
    } catch (error) {
      addToast({ title: "Failed to load expenses" });
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      const [catsRes, depsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/departments"),
      ]);

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData.categories || []);
      }

      if (depsRes.ok) {
        const depsData = await depsRes.json();
        setDepartments(depsData.departments || []);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchFilterData();
  }, [pagination.page, filters]);

  const allDeps = useMemo(() => {
    const cats: { key: string; label: string }[] = [
      { key: "all", label: "All Departments" },
    ];
    if (departments?.length > 0) {
      cats.push(
        ...departments.map((c) => ({
          key: c.id,
          label: c.name,
        }))
      );
    }
    return cats;
  }, [departments]);

  const allCats = useMemo(() => {
    const cats: { key: string; label: string }[] = [
      { key: "all", label: "All Categories" },
    ];
    if (categories?.length > 0) {
      cats.push(
        ...categories.map((c) => ({
          key: c.id,
          label: c.name,
        }))
      );
    }
    return cats;
  }, [categories]);

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
      const response = await fetch(`/api/expenses/${expenseToDelete}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        addToast({ title: result.message });
        fetchExpenses();
      } else {
        addToast({ title: result?.error || "An error occured" });
      }
    } catch (error) {
      addToast({ title: "Failed to delete expense" });
    } finally {
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (response.ok) {
        addToast({ title: result.message });
        fetchExpenses();
      } else {
        addToast({ title: result.error });
      }
    } catch (error) {
      addToast({ title: "Failed to update status" });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedExpense(null);
    fetchExpenses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedExpense(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "primary";
      case "REJECTED":
        return "danger";
      case "PAID":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <IconEdit className="w-4 h-4" />;
      case "PENDING":
        return <IconClock className="w-4 h-4" />;
      case "APPROVED":
        return <IconCheck className="w-4 h-4" />;
      case "REJECTED":
        return <IconX className="w-4 h-4" />;
      case "PAID":
        return <IconCurrencyDollar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            color="primary"
            startContent={<IconPlus className="w-4 h-4" />}
            onPress={() => setShowForm(true)}
            isDisabled={session?.user?.role === "VIEWER"}
          >
            Add Expense
          </Button>
          <Button
            variant="flat"
            startContent={<IconDownload className="w-4 h-4" />}
            onPress={() => {
              /* Implement export */
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(summary.totalAmount)}
              </h3>
              <p className="text-sm text-gray-500">
                {summary.totalCount} expenses
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconCurrencyDollar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Expense
              </p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(summary.averageAmount)}
              </h3>
              <p className="text-sm text-gray-500">Per transaction</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IconCategory className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending Approval
              </p>
              <h3 className="text-2xl font-bold">
                {expenses.filter((e) => e.status === "PENDING").length}
              </h3>
              <p className="text-sm text-gray-500">Awaiting review</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <IconClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select
              label="Status"
              placeholder="All Statuses"
              selectedKeys={[filters.status]}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <SelectItem key="all">All Statuses</SelectItem>
              <SelectItem key="DRAFT">Draft</SelectItem>
              <SelectItem key="PENDING">Pending</SelectItem>
              <SelectItem key="APPROVED">Approved</SelectItem>
              <SelectItem key="REJECTED">Rejected</SelectItem>
              <SelectItem key="PAID">Paid</SelectItem>
            </Select>

            <Select
              label="Category"
              placeholder="All Categories"
              selectedKeys={[filters.categoryId]}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              items={allCats}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Select
              label="Department"
              placeholder="All Departments"
              selectedKeys={[filters.departmentId]}
              onChange={(e) =>
                handleFilterChange("departmentId", e.target.value)
              }
              items={allDeps}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Input
              label="Search"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={filters.startDate ? parseDate(filters.startDate) : null}
                onChange={(date) =>
                  handleFilterChange(
                    "startDate",
                    date ? dayjs(date.toString()).format("YYYY-MM-DD") : ""
                  )
                }
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? parseDate(filters.endDate) : null}
                onChange={(date) =>
                  handleFilterChange(
                    "endDate",
                    date ? dayjs(date.toString()).format("YYYY-MM-DD") : ""
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                onPress={handleResetFilters}
                startContent={<IconFilter className="w-4 h-4" />}
              >
                Clear Filters
              </Button>
              <Button
                variant="light"
                onPress={fetchExpenses}
                startContent={<IconRefresh className="w-4 h-4" />}
                isLoading={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <Table
              aria-label="Expenses table"
              removeWrapper
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CREATED BY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={loading}
                loadingContent={<Spinner />}
                emptyContent="No expenses found"
              >
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {expense.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.category ? (
                        <Chip
                          variant="flat"
                          style={{
                            backgroundColor: `${expense.category.color}20`,
                          }}
                        >
                          <span style={{ color: expense.category.color }}>
                            {expense.category.name}
                          </span>
                        </Chip>
                      ) : (
                        <Chip variant="flat" color="default">
                          Uncategorized
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.department ? (
                        <Chip variant="flat" color="primary">
                          {expense.department.name}
                        </Chip>
                      ) : (
                        <Chip variant="flat" color="default">
                          General
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {dayjs(expense.date).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(expense.status)}
                        variant="flat"
                        startContent={getStatusIcon(expense.status)}
                      >
                        {expense.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {expense.createdByUser && (
                        <div>
                          <p className="text-sm">
                            {expense.createdByUser.firstName}{" "}
                            {expense.createdByUser.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {expense.createdByUser.email}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              router.push(`/expenses/${expense.id}`)
                            }
                          >
                            <IconEye className="w-4 h-4" />
                          </Button>
                        </Tooltip>

                        {(session?.user?.role === "ADMIN" ||
                          (session?.user?.role === "STAFF" &&
                            expense.createdByUser?.email ===
                              session.user.email)) && (
                          <Tooltip content="Edit">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEdit(expense)}
                            >
                              <IconEdit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}

                        {["ADMIN", "MANAGER"].includes(
                          session?.user?.role || ""
                        ) &&
                          ["PENDING", "APPROVED"].includes(expense.status) && (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <IconChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Status actions">
                                {expense.status === "PENDING" ? (
                                  <>
                                    <DropdownItem
                                      key="approve"
                                      onPress={() =>
                                        handleUpdateStatus(
                                          expense.id,
                                          "APPROVED"
                                        )
                                      }
                                      className="text-success"
                                    >
                                      Approve
                                    </DropdownItem>
                                    <DropdownItem
                                      key="reject"
                                      onPress={() =>
                                        handleUpdateStatus(
                                          expense.id,
                                          "REJECTED"
                                        )
                                      }
                                      className="text-danger"
                                    >
                                      Reject
                                    </DropdownItem>
                                  </>
                                ) : null}
                                {expense.status === "APPROVED" ? (
                                  <DropdownItem
                                    key="mark-paid"
                                    onPress={() =>
                                      handleUpdateStatus(expense.id, "PAID")
                                    }
                                    className="text-success"
                                  >
                                    Mark as Paid
                                  </DropdownItem>
                                ) : null}
                              </DropdownMenu>
                            </Dropdown>
                          )}

                        {(session?.user?.role === "ADMIN" ||
                          (session?.user?.role === "STAFF" &&
                            expense.createdByUser?.email ===
                              session.user.email &&
                            expense.status === "DRAFT")) && (
                          <Tooltip content="Delete">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteClick(expense.id)}
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Expense Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ExpenseForm
              expense={selectedExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
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
