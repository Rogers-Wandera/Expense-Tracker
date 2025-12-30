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
import { expenseSchema, ExpenseFormData } from "@/lib/validations/expense";
import { PaymentMethod, ExpenseStatus } from "@/generated/prisma";
import { useForm } from "@tanstack/react-form";

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
}

export function ExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const defaultValues: ExpenseFormData = expense
    ? {
        ...expense,
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }
    : {
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        departmentId: undefined,
        paymentMethod: PaymentMethod.CARD,
        status: ExpenseStatus.PENDING,
        attachmentUrl: "",
        notes: "",
      };
  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: ({ value }) => {
      // Do something with form data
      alert(JSON.stringify(value, null, 2));
    },
  });

  useEffect(() => {
    fetchCategoriesAndDepartments();
  }, []);

  const fetchCategoriesAndDepartments = async () => {
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
      console.error("Error fetching data:", error);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({ title: result.message });
        onSuccess();
      } else {
        addToast({ title: result.error || "Failed to save expense" });
      }
    } catch (error) {
      addToast({ title: "Failed to save expense" });
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
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <form.Field name="amount">
                {(field) => (
                  <Input
                    type="number"
                    label="Amount (UGX)"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-gray-500">UGX</span>
                      </div>
                    }
                  />
                )}
              </form.Field>
            </div>
            <div>
              <Input
                {...register("date")}
                type="date"
                label="Date"
                isInvalid={!!errors.date}
                errorMessage={errors.date?.message}
              />
            </div>
          </div>

          <div>
            <Input
              {...register("description")}
              label="Description"
              placeholder="Enter expense description"
              isInvalid={!!errors.description}
              errorMessage={errors.description?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                {...register("categoryId")}
                label="Category"
                placeholder="Select category"
                selectedKeys={[watch("categoryId")]}
                onChange={(e) => setValue("categoryId", e.target.value)}
                isInvalid={!!errors.categoryId}
                errorMessage={errors.categoryId?.message}
              >
                {categories.map((category) => (
                  <SelectItem key={category.id}>{category.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Select
                {...register("departmentId")}
                label="Department (Optional)"
                placeholder="Select department"
                selectedKeys={
                  watch("departmentId") ? [watch("departmentId")!] : []
                }
                onChange={(e) =>
                  setValue("departmentId", e.target.value || null)
                }
                isInvalid={!!errors.departmentId}
                errorMessage={errors.departmentId?.message}
              >
                {departments.map((dept) => (
                  <SelectItem key={dept.id}>{dept.name}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                {...register("paymentMethod")}
                label="Payment Method"
                placeholder="Select payment method"
                selectedKeys={[watch("paymentMethod")]}
                onChange={(e) =>
                  setValue("paymentMethod", e.target.value as PaymentMethod)
                }
                isInvalid={!!errors.paymentMethod}
                errorMessage={errors.paymentMethod?.message}
              >
                {paymentMethods.map((method) => (
                  <SelectItem key={method}>
                    {method.replace("_", " ")}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {expense && (
              <div>
                <Select
                  {...register("status")}
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[watch("status") || ExpenseStatus.PENDING]}
                  onChange={(e) =>
                    setValue("status", e.target.value as ExpenseStatus)
                  }
                  isInvalid={!!errors.status}
                  errorMessage={errors.status?.message}
                >
                  {Object.values(ExpenseStatus).map((status) => (
                    <SelectItem key={status}>{status}</SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Input
              {...register("attachmentUrl")}
              label="Attachment URL (Optional)"
              placeholder="https://example.com/receipt.jpg"
              isInvalid={!!errors.attachmentUrl}
              errorMessage={errors.attachmentUrl?.message}
            />
          </div>

          <div>
            <Textarea
              {...register("notes")}
              label="Notes (Optional)"
              placeholder="Add any additional notes..."
              minRows={3}
              isInvalid={!!errors.notes}
              errorMessage={errors.notes?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="light" onPress={onCancel} isDisabled={loading}>
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
