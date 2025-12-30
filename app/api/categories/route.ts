import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for category
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name is too long"),
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
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can create categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to create categories",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = categorySchema.parse(body);

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error: any) {
    console.error("Create category error:", error);

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
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
