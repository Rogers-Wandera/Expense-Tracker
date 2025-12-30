"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Badge,
  Button,
} from "@heroui/react";
import { IconEye, IconReceipt } from "@tabler/icons-react";
import dayjs from "dayjs";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  category?: { name: string; color: string };
  department?: { name: string; color: string };
  createdByUser?: { firstName: string; lastName: string };
}

interface RecentExpensesTableProps {
  expenses: Expense[];
}

export function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
  // Format UGX currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "warning" | "danger"
    > = {
      DRAFT: "default",
      PENDING: "warning",
      APPROVED: "primary",
      REJECTED: "danger",
      PAID: "success",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      DRAFT: "Draft",
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      PAID: "Paid",
    };
    return texts[status] || status;
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IconReceipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No expenses found for the selected period
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No expenses to display. Try changing your filters or add new expenses.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IconReceipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest {expenses.length} expense submissions
              </p>
            </div>
          </div>
          <Button variant="flat" size="sm">
            View All
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table aria-label="Recent expenses table" removeWrapper>
          <TableHeader>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>DEPARTMENT</TableColumn>
            <TableColumn>AMOUNT (UGX)</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="text-gray-900 dark:text-white line-clamp-1">
                      {expense.description || "No description"}
                    </p>
                    {expense.createdByUser && (
                      <p className="text-sm text-gray-500">
                        By {expense.createdByUser.firstName}{" "}
                        {expense.createdByUser.lastName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {expense.category ? (
                    <Badge
                      variant="flat"
                      style={{ backgroundColor: `${expense.category.color}20` }}
                    >
                      <span style={{ color: expense.category.color }}>
                        {expense.category.name}
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="flat" color="default">
                      Uncategorized
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {expense.department ? (
                    <Badge variant="flat" color="primary">
                      {expense.department.name}
                    </Badge>
                  ) : (
                    <Badge variant="flat" color="default">
                      General
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  {dayjs(expense.date).format("MMM D, YYYY")}
                </TableCell>
                <TableCell>
                  <Badge color={getStatusColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button isIconOnly size="sm" variant="light">
                    <IconEye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
