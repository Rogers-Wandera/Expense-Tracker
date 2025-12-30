import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations/expense";

// GET: Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: id },
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
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.role === "VIEWER" &&
      !["APPROVED", "PAID"].includes(expense.status)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      session.user.role === "STAFF" &&
      expense.createdBy !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Get expense error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT: Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is required" },
        { status: 404 }
      );
    }

    // Check if expense exists and user has permission
    const existingExpense = await prisma.expense.findUnique({
      where: { id: id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    // Permission checks
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      session.user.role === "STAFF" &&
      existingExpense.createdBy !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = expenseSchema.parse({
      ...body,
      amount: parseFloat(body.amount),
      date: new Date(body.date),
    });

    // Update expense
    const expense = await prisma.expense.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedBy: session.user.id,
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
      message: "Expense updated successfully",
    });
  } catch (error: any) {
    console.error("Update expense error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE: Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    // Permission checks - Only ADMIN can delete, or STAFF can delete their own drafts
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.user.role === "STAFF") {
      if (existingExpense.createdBy !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (existingExpense.status !== "DRAFT") {
        return NextResponse.json(
          { success: false, error: "You can only delete draft expenses" },
          { status: 403 }
        );
      }
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

// PATCH: Update expense status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only MANAGER and ADMIN can update status
    if (!["ADMIN", "MANAGER"].includes(session.user.role as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    // Update status
    const expense = await prisma.expense.update({
      where: { id: id },
      data: {
        status,
        updatedBy: session.user.id,
      },
      include: {
        category: { select: { name: true } },
        department: { select: { name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: `Expense ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update expense status" },
      { status: 500 }
    );
  }
}
