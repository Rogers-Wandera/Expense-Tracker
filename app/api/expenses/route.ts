import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations/expense";
import { ExpenseStatus } from "@/generated/prisma";
import dayjs from "dayjs";

// GET: Fetch expenses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const departmentId = searchParams.get("departmentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (session.user.role === "VIEWER") {
      where.status = { in: ["APPROVED", "PAID"] };
    } else if (session.user.role === "STAFF") {
      where.createdBy = session.user.id;
    }

    // Apply filters
    if (status && status !== "all") {
      where.status = status;
    }
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }
    if (departmentId && departmentId !== "all") {
      where.departmentId = departmentId;
    }

    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        const start = dayjs(startDate).startOf("day").toDate();
        where.date.gte = start;
      }

      if (endDate) {
        const end = dayjs(endDate).endOf("day").toDate();
        where.date.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.expense.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Get expenses with related data
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: { select: { name: true, color: true } },
        department: { select: { name: true, color: true } },
        createdByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
        updatedByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Get summary stats
    const summaryStats = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: {
          totalAmount: summaryStats._sum.amount || 0,
          totalCount: summaryStats._count.id,
          averageAmount: summaryStats._avg.amount || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// Create a new Expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      );
    }

    // Check permissions
    if (session.user.role === "VIEWER") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to create expenses.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input data first
    if (!body.amount || isNaN(parseFloat(body.amount))) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid amount." },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Description is required." },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: "Date is required." },
        { status: 400 }
      );
    }

    // Parse date using dayjs
    let parsedDate: Date;
    try {
      parsedDate = dayjs(body.date).toDate();
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid date." },
        { status: 400 }
      );
    }

    // Parse amount
    const amount = parseFloat(body.amount);
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0." },
        { status: 400 }
      );
    }

    // Validate using Zod schema
    const validatedData = expenseSchema.parse({
      ...body,
      amount,
      date: parsedDate,
    });

    // Check if category exists (if provided)
    if (validatedData.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: "Selected category does not exist." },
          { status: 400 }
        );
      }
    }

    // Check if department exists (if provided)
    if (validatedData.departmentId) {
      const departmentExists = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      });
      if (!departmentExists) {
        return NextResponse.json(
          { success: false, error: "Selected department does not exist." },
          { status: 400 }
        );
      }
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        status: validatedData.status || ExpenseStatus.PENDING,
      },
      include: {
        category: { select: { name: true, color: true } },
        department: { select: { name: true, color: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: "Expense created successfully",
    });
  } catch (error: any) {
    console.error("Create expense error:", error);

    // Handle Zod validation errors with user-friendly messages
    if (error.name === "ZodError") {
      // Get the first error message for simplicity
      const firstError = error.errors[0];
      let errorMessage = "Validation error";

      if (firstError?.message) {
        errorMessage = firstError.message;
      } else if (firstError?.path?.length > 0) {
        // Format field name (e.g., "amount" -> "Amount")
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
      // Unique constraint violation
      return NextResponse.json(
        {
          success: false,
          error: "An expense with these details already exists.",
        },
        { status: 400 }
      );
    }

    if (error.code === "P2003") {
      // Foreign key constraint violation
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reference to category or department.",
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create expense. Please try again.",
      },
      { status: 500 }
    );
  }
}
