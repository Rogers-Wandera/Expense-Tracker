"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  addToast,
} from "@heroui/react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { PaymentMethod, ExpenseStatus } from "@/generated/prisma";
import { useMutate } from "@/hooks/use-mutate";

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  expense?: any;
  onSuccess: () => void;
  onCancel: () => void;
  categories: Category[];
  departments: Department[];
}

export function ExpenseForm({
  expense,
  onSuccess,
  onCancel,
  departments,
  categories,
}: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { mutateAsync } = useMutate({});

  // Set default values
  const defaultValues = {
    amount: expense?.amount || 0,
    description: expense?.description || "",
    date: expense?.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    categoryId: expense?.categoryId || "",
    departmentId: expense?.departmentId || null,
    paymentMethod: expense?.paymentMethod || PaymentMethod.CARD,
    status: expense?.status || ExpenseStatus.PENDING,
    attachmentUrl: expense?.attachmentUrl || "",
    notes: expense?.notes || "",
  };

  const form = useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await handleSubmit(value);
    },
  });

  useEffect(() => {
    if (!isInitialized && categories.length > 0 && departments.length > 0) {
      // Set initial values after data is loaded
      form.reset();
      setIsInitialized(true);
    }
  }, [categories, departments, isInitialized]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const url = expense ? `/expenses/${expense.id}` : "/expenses";
      const method = expense ? "PUT" : "POST";

      // Convert amount to number
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
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
        onSuccess();
      } else {
        if (response.details) {
          response.details.forEach((error: any) => {
            addToast({
              title: `${error.path}: ${error.message}`,
            });
          });
        } else {
          addToast({
            title: response.error || "Failed to save expense",
            color: "danger",
          });
        }
      }
    } catch (error: any) {
      addToast({
        title: error.message || "Failed to save expense",
        color: "danger",
      });
      console.error("Error saving expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = Object.values(PaymentMethod);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {expense ? "Edit Expense" : "Add New Expense"}
        </h2>
        <Button isIconOnly size="sm" variant="light" onPress={onCancel}>
          <IconX className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount Field */}
            <form.Field name="amount">
              {(field) => (
                <div>
                  <Input
                    type="number"
                    label="Amount (UGX)"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(", ")}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-gray-500">UGX</span>
                      </div>
                    }
                  />
                </div>
              )}
            </form.Field>

            {/* Date Field */}
            <form.Field name="date">
              {(field) => (
                <div>
                  <Input
                    type="date"
                    label="Date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(", ")}
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Description Field */}
          <form.Field name="description">
            {(field) => (
              <div>
                <Input
                  label="Description"
                  placeholder="Enter expense description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Field */}
            <form.Field name="categoryId">
              {(field) => (
                <div>
                  <Select
                    label="Category"
                    placeholder="Select category"
                    selectedKeys={field.state.value ? [field.state.value] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      field.handleChange(key);
                    }}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(", ")}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id}>{category.name}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Department Field */}
            <form.Field name="departmentId">
              {(field) => (
                <div>
                  <Select
                    label="Department (Optional)"
                    placeholder="Select department"
                    selectedKeys={field.state.value ? [field.state.value] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      field.handleChange(key || null);
                    }}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(", ")}
                    items={[
                      {
                        id: "",
                        name: "No Department",
                      },
                      ...departments,
                    ]}
                  >
                    {(item) => (
                      <SelectItem key={item.id}>{item.name}</SelectItem>
                    )}
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method Field */}
            <form.Field name="paymentMethod">
              {(field) => (
                <div>
                  <Select
                    label="Payment Method"
                    placeholder="Select payment method"
                    selectedKeys={[field.state.value]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as PaymentMethod;
                      field.handleChange(key);
                    }}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(", ")}
                  >
                    {paymentMethods.map((method) => (
                      <SelectItem key={method}>
                        {method.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Status Field (only for edit) */}
            {expense && (
              <form.Field name="status">
                {(field) => (
                  <div>
                    <Select
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={[field.state.value]}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as ExpenseStatus;
                        field.handleChange(key);
                      }}
                      isInvalid={field.state.meta.errors.length > 0}
                      errorMessage={field.state.meta.errors.join(", ")}
                    >
                      {Object.values(ExpenseStatus).map((status) => (
                        <SelectItem key={status}>{status}</SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              </form.Field>
            )}
          </div>

          {/* Attachment URL Field */}
          <form.Field name="attachmentUrl">
            {(field) => (
              <div>
                <Input
                  label="Attachment URL (Optional)"
                  placeholder="https://example.com/receipt.jpg"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              </div>
            )}
          </form.Field>

          {/* Notes Field */}
          <form.Field name="notes">
            {(field) => (
              <div>
                <Textarea
                  label="Notes (Optional)"
                  placeholder="Add any additional notes..."
                  minRows={3}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(", ")}
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="light"
              onPress={onCancel}
              isDisabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              startContent={!loading && <IconCheck className="w-4 h-4" />}
            >
              {expense ? "Update Expense" : "Create Expense"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
