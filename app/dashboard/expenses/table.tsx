"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Avatar,
} from "@heroui/react";
import {
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCurrencyDollar,
  IconEdit,
  IconEye,
  IconTrash,
  IconX,
  IconBuilding,
  IconCategory,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { Expense, PaginationData } from "./types";

type Props = {
  loading: boolean;
  expenses: Expense[];
  session: Session | null;
  handleEdit: (expense: Expense) => void;
  handleDeleteClick: (id: string) => void;
  handleUpdateStatus: (id: string, status: string) => Promise<void>;
  handlePageChange: (page: number) => void;
  pagination: PaginationData;
  setPagination: Dispatch<SetStateAction<PaginationData>>;
};

const ExpenseTable = ({
  loading,
  expenses,
  session,
  handleEdit,
  handleDeleteClick,
  handleUpdateStatus,
  handlePageChange,
  pagination,
}: Props) => {
  const router = useRouter();

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
        return <IconEdit className="w-3 h-3" />;
      case "PENDING":
        return <IconClock className="w-3 h-3" />;
      case "APPROVED":
        return <IconCheck className="w-3 h-3" />;
      case "REJECTED":
        return <IconX className="w-3 h-3" />;
      case "PAID":
        return <IconCurrencyDollar className="w-3 h-3" />;
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

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="border-none shadow-sm">
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <Table
            aria-label="Expenses table"
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
              <TableColumn className="w-62.5">DESCRIPTION</TableColumn>
              <TableColumn className="w-25">AMOUNT</TableColumn>
              <TableColumn className="w-30">DATE</TableColumn>
              <TableColumn className="w-25">CATEGORY</TableColumn>
              <TableColumn className="w-25">STATUS</TableColumn>
              <TableColumn className="w-35">CREATED BY</TableColumn>
              <TableColumn className="w-30 text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<Spinner size="sm" />}
              emptyContent={
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No expenses found
                </div>
              }
            >
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {expense.department && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <IconBuilding className="w-3 h-3" />
                            <span>{expense.department.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm">
                      {formatCurrency(expense.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {dayjs(expense.date).format("DD/MM/YYYY")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Chip
                        size="sm"
                        variant="flat"
                        style={{
                          backgroundColor: `${expense.category.color}15`,
                        }}
                        classNames={{
                          content: "text-xs font-medium px-1",
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: expense.category.color }}
                          />
                          <span
                            className="truncate"
                            title={expense.category.name}
                          >
                            {expense.category.name}
                          </span>
                        </div>
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat" color="default">
                        <div className="flex items-center gap-1">
                          <IconCategory className="w-3 h-3" />
                          <span>Uncategorized</span>
                        </div>
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getStatusColor(expense.status)}
                      variant="flat"
                      startContent={getStatusIcon(expense.status)}
                      classNames={{
                        content: "text-xs font-medium px-1",
                      }}
                    >
                      <span className="capitalize">
                        {expense.status.toLowerCase()}
                      </span>
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {expense.createdByUser && (
                      <div className="flex items-center gap-2">
                        <Avatar
                          size="sm"
                          name={getUserInitials(
                            expense.createdByUser.firstName,
                            expense.createdByUser.lastName
                          )}
                          classNames={{
                            base: "w-8 h-8 text-xs",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-25">
                            {expense.createdByUser.firstName}{" "}
                            {expense.createdByUser.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-25">
                            {expense.createdByUser.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="View Details">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="min-w-8 w-8 h-8"
                          onPress={() =>
                            router.push(`/dashboard/expenses/${expense.id}`)
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
                            className="min-w-8 w-8 h-8"
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
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="min-w-8 w-8 h-8"
                              >
                                <IconChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Status actions">
                              {expense.status === "PENDING" ? (
                                <>
                                  <DropdownItem
                                    key="approve"
                                    onPress={() =>
                                      handleUpdateStatus(expense.id, "APPROVED")
                                    }
                                    className="text-success"
                                    startContent={
                                      <IconCheck className="w-4 h-4" />
                                    }
                                  >
                                    Approve
                                  </DropdownItem>
                                  <DropdownItem
                                    key="reject"
                                    onPress={() =>
                                      handleUpdateStatus(expense.id, "REJECTED")
                                    }
                                    className="text-danger"
                                    startContent={<IconX className="w-4 h-4" />}
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
                                  startContent={
                                    <IconCurrencyDollar className="w-4 h-4" />
                                  }
                                >
                                  Mark as Paid
                                </DropdownItem>
                              ) : null}
                            </DropdownMenu>
                          </Dropdown>
                        )}

                      {(session?.user?.role === "ADMIN" ||
                        (session?.user?.role === "STAFF" &&
                          expense.createdByUser?.email === session.user.email &&
                          expense.status === "DRAFT")) && (
                        <Tooltip content="Delete">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="min-w-8 w-8 h-8"
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
  );
};

export default ExpenseTable;
