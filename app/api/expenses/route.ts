import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations/expense";
import { ExpenseStatus } from "@/generated/prisma";

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
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
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

// POST: Create new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = expenseSchema.parse({
      ...body,
      amount: parseFloat(body.amount),
      date: new Date(body.date),
    });

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

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}
