import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema for user creation
const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(UserRole),
  departmentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

// GET: Fetch users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can manage users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    // Apply filters
    if (role && role !== "all") {
      where.role = role;
    }

    if (departmentId && departmentId !== "all") {
      where.departmentId = departmentId;
    }

    if (isActive && isActive !== "all") {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Exclude deleted users
    if (
      where.isActive ||
      where.isActive === true ||
      where.isActive === undefined
    ) {
      where.deletedAt = null;
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Get users with related data
    const users = await prisma.user.findMany({
      where,
      include: {
        department: { select: { name: true, color: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    // Get summary stats
    const activeUsers = await prisma.user.count({
      where: { ...where, isActive: true },
    });

    const lockedUsers = await prisma.user.count({
      where: { ...where, isLocked: true },
    });

    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      where,
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: {
          totalUsers: totalCount,
          activeUsers,
          lockedUsers,
          roleDistribution,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      );
    }

    // Only ADMIN can create users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to create users." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.firstName || body.firstName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "First name is required." },
        { status: 400 }
      );
    }

    if (!body.lastName || body.lastName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Last name is required." },
        { status: 400 }
      );
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (!body.role || !Object.values(UserRole).includes(body.role)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid role." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    // Check if department exists (if provided)
    if (body.departmentId) {
      const departmentExists = await prisma.department.findUnique({
        where: { id: body.departmentId, isActive: true },
      });

      if (!departmentExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected department does not exist or is inactive.",
          },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Validate using schema
    const validatedData = createUserSchema.parse({
      ...body,
      password: hashedPassword,
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        department: { select: { name: true, color: true } },
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Create user error:", error);

    if (error.name === "ZodError") {
      // Get the first error message
      const firstError = error.errors[0];
      let errorMessage = "Validation error";

      if (firstError?.message) {
        errorMessage = firstError.message;
      } else if (firstError?.path?.length > 0) {
        const fieldName = firstError.path[0];
        const formattedFieldName =
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errorMessage = `${formattedFieldName} is invalid.`;
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create user. Please try again.",
      },
      { status: 500 }
    );
  }
}
