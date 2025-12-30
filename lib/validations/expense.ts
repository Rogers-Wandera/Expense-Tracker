import { z } from "zod";
import { ExpenseStatus, PaymentMethod } from "@/generated/prisma";

export const expenseSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description is too long"),
  date: z.string().or(z.date()),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().optional().nullable(),
  paymentMethod: z.enum(PaymentMethod),
  status: z.enum(ExpenseStatus).optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
