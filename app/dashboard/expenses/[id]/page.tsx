"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider,
  addToast,
} from "@heroui/react";
import {
  IconArrowLeft,
  IconEdit,
  IconCalendar,
  IconCategory,
  IconBuilding,
  IconReceipt,
  IconCurrencyDollar,
  IconCreditCard,
  IconFileText,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<any>(null);

  useEffect(() => {
    fetchExpense();
  }, [params.id]);

  const fetchExpense = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses/${params.id}`);
      const result = await response.json();

      if (response.ok) {
        setExpense(result.data);
      } else {
        addToast({ title: result?.error || "Failed to fetch expense" });
        router.push("/expenses");
      }
    } catch (error) {
      addToast({ title: "Failed to load expense" });
      router.push("/expenses");
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!expense) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            onPress={() => router.push("/dashboard/expenses")}
            startContent={<IconArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Expense Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View expense information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Chip color={getStatusColor(expense.status)} variant="flat" size="sm">
            {expense.status}
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Expense Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <IconReceipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Description
                    </p>
                    <p className="font-medium">{expense.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <IconCurrencyDollar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Amount
                    </p>
                    <p className="font-medium text-lg">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Date
                  </p>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="w-4 h-4 text-gray-400" />
                    <span>{dayjs(expense.date).format("MMMM D, YYYY")}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </p>
                  <div className="flex items-center gap-2">
                    <IconCategory className="w-4 h-4 text-gray-400" />
                    <span>{expense.category?.name || "Uncategorized"}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Department
                  </p>
                  <div className="flex items-center gap-2">
                    <IconBuilding className="w-4 h-4 text-gray-400" />
                    <span>{expense.department?.name || "General"}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-2">
                    <IconCreditCard className="w-4 h-4 text-gray-400" />
                    <span>{expense.paymentMethod?.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Notes</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Attachment */}
          {expense.attachmentUrl && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Attachment</h2>
              </CardHeader>
              <CardBody>
                <a
                  href={expense.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <IconFileText className="w-4 h-4" />
                  View Attachment
                </a>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar - Audit Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Created By</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IconUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">
                    {expense.createdByUser?.firstName}{" "}
                    {expense.createdByUser?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {expense.createdByUser?.email}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created
                </p>
                <p>{dayjs(expense.createdAt).format("MMM D, YYYY h:mm A")}</p>
              </div>
            </CardBody>
          </Card>

          {expense.updatedAt && expense.updatedByUser && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Last Updated</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <IconUser className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {expense.updatedByUser?.firstName}{" "}
                      {expense.updatedByUser?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.updatedByUser?.email}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updated
                  </p>
                  <p>{dayjs(expense.updatedAt).format("MMM D, YYYY h:mm A")}</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
