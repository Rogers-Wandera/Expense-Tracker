import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for department
const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Name is too long"),
  code: z
    .string()
    .min(1, "Department code is required")
    .max(10, "Code is too long"),
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
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// POST: Create new department
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can create departments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to create departments",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Convert budget to number if provided
    if (body.budget) {
      body.budget = parseFloat(body.budget);
    }

    // Validate input
    const validatedData = departmentSchema.parse(body);

    // Check if department with same name already exists
    const existingDepartmentByName = await prisma.department.findUnique({
      where: { name: validatedData.name },
    });

    if (existingDepartmentByName) {
      return NextResponse.json(
        { success: false, error: "A department with this name already exists" },
        { status: 400 }
      );
    }

    // Check if department with same code already exists
    const existingDepartmentByCode = await prisma.department.findUnique({
      where: { code: validatedData.code },
    });

    if (existingDepartmentByCode) {
      return NextResponse.json(
        { success: false, error: "A department with this code already exists" },
        { status: 400 }
      );
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: department,
      message: "Department created successfully",
    });
  } catch (error: any) {
    console.error("Create department error:", error);

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
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}
