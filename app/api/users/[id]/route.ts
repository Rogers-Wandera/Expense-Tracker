import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema for user update
const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(UserRole).optional(),
  departmentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// GET: Get single user
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

    // Only ADMIN can view user details
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        department: { select: { name: true, color: true } },
        createdByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
        updatedByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT: Update user
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

    // Only ADMIN can update users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "A user with this email already exists." },
          { status: 400 }
        );
      }
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

    // Prepare update data
    const updateData: any = { ...body };

    // Hash password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Remove empty values
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === null ||
        updateData[key] === undefined ||
        updateData[key] === ""
      ) {
        delete updateData[key];
      }
    });

    // Validate using schema
    const validatedData = updateUserSchema.parse(updateData);

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: session.user.id,
        updatedAt: new Date(),
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
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.name === "ZodError") {
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

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update user. Please try again.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (soft delete)
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

    // Only ADMIN can delete users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// PATCH: Toggle user status (lock/unlock, activate/deactivate)
export async function PATCH(
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

    // Only ADMIN can update user status
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, value } = body;

    if (!action || !["lock", "activate", "verify"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    if (typeof value !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Value must be a boolean" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-modification
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot modify your own account." },
        { status: 400 }
      );
    }

    // Prepare update data based on action
    let updateData: any = {};
    let message = "";

    switch (action) {
      case "lock":
        updateData.isLocked = value;
        message = value
          ? "User locked successfully"
          : "User unlocked successfully";
        break;
      case "activate":
        updateData.isActive = value;
        message = value
          ? "User activated successfully"
          : "User deactivated successfully";
        break;
      case "verify":
        updateData.isVerified = value;
        message = value
          ? "User verified successfully"
          : "User verification removed";
        break;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
