import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for category update
const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name is too long")
    .optional(),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code")
    .optional()
    .nullable(),
  icon: z.string().max(50, "Icon name is too long").optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET: Get single category
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

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT: Update category
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

    // Only ADMIN can update categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update categories",
        },
        { status: 403 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check if name is being changed and if new name already exists
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const categoryWithSameName = await prisma.category.findUnique({
        where: { name: validatedData.name },
      });

      if (categoryWithSameName) {
        return NextResponse.json(
          { success: false, error: "A category with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    console.error("Update category error:", error);

    if (error.name === "ZodError") {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Validation error" },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: Delete category
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

    // Only ADMIN can delete categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete categories",
        },
        { status: 403 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has expenses
    const categoryExpenses = await prisma.expense.count({
      where: { categoryId: id },
    });

    if (categoryExpenses > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete category because it has associated expenses. Please reassign expenses first.",
        },
        { status: 400 }
      );
    }

    // Delete category (hard delete)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
