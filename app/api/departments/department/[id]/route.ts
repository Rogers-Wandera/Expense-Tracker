import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for department update
const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Name is too long")
    .optional(),
  code: z
    .string()
    .min(1, "Department code is required")
    .max(10, "Code is too long")
    .optional(),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .nullable(),
  budget: z.number().min(0, "Budget cannot be negative").optional().nullable(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code")
    .optional()
    .nullable(),
  icon: z.string().max(50, "Icon name is too long").optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET: Get single department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// PUT: Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can update departments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update departments",
        },
        { status: 403 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Convert budget to number if provided
    if (body.budget) {
      body.budget = parseFloat(body.budget);
    }

    const validatedData = updateDepartmentSchema.parse(body);

    // Check if name is being changed and if new name already exists
    if (validatedData.name && validatedData.name !== existingDepartment.name) {
      const departmentWithSameName = await prisma.department.findUnique({
        where: { name: validatedData.name },
      });

      if (departmentWithSameName) {
        return NextResponse.json(
          {
            success: false,
            error: "A department with this name already exists",
          },
          { status: 400 }
        );
      }
    }

    // Check if code is being changed and if new code already exists
    if (validatedData.code && validatedData.code !== existingDepartment.code) {
      const departmentWithSameCode = await prisma.department.findUnique({
        where: { code: validatedData.code },
      });

      if (departmentWithSameCode) {
        return NextResponse.json(
          {
            success: false,
            error: "A department with this code already exists",
          },
          { status: 400 }
        );
      }
    }

    // Update department
    const department = await prisma.department.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: department,
      message: "Department updated successfully",
    });
  } catch (error: any) {
    console.error("Update department error:", error);

    if (error.name === "ZodError") {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      const fieldName = field === "name" ? "name" : "code";
      return NextResponse.json(
        {
          success: false,
          error: `A department with this ${fieldName} already exists`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update department" },
      { status: 500 }
    );
  }
}

// DELETE: Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can delete departments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete departments",
        },
        { status: 403 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if department has users
    const departmentUsers = await prisma.user.count({
      where: { departmentId: id },
    });

    if (departmentUsers > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete department because it has assigned users. Please reassign users first.",
        },
        { status: 400 }
      );
    }

    // Check if department has expenses
    const departmentExpenses = await prisma.expense.count({
      where: { departmentId: id },
    });

    if (departmentExpenses > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete department because it has associated expenses. Please reassign expenses first.",
        },
        { status: 400 }
      );
    }

    // Delete department (hard delete)
    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
