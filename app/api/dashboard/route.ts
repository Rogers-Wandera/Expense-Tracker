// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import dayjs from "dayjs";
// import { prisma } from "@/lib/prisma";

// // Helper function to get date range
// function getDateRange(period: string) {
//   const now = dayjs();

//   switch (period) {
//     case "today":
//       return {
//         start: now.startOf("day").toDate(),
//         end: now.endOf("day").toDate(),
//       };
//     case "week":
//       return { start: now.subtract(1, "week").toDate(), end: now.toDate() };
//     case "month":
//       return { start: now.subtract(1, "month").toDate(), end: now.toDate() };
//     case "quarter":
//       return { start: now.subtract(3, "month").toDate(), end: now.toDate() };
//     case "year":
//       return { start: now.subtract(1, "year").toDate(), end: now.toDate() };
//     default: // 'all' or custom
//       return { start: dayjs("2020-01-01").toDate(), end: now.toDate() };
//   }
// }

// // Helper to generate chart data
// function generateChartData(period: string) {
//   const now = dayjs();
//   const data = [];

//   switch (period) {
//     case "week":
//       for (let i = 6; i >= 0; i--) {
//         const date = now.subtract(i, "day");
//         data.push({
//           date: date.format("ddd"),
//           fullDate: date.format("YYYY-MM-DD"),
//           expenses: 0,
//         });
//       }
//       break;
//     case "month":
//       for (let i = 29; i >= 0; i--) {
//         const date = now.subtract(i, "day");
//         data.push({
//           date: date.format("D"),
//           fullDate: date.format("YYYY-MM-DD"),
//           expenses: 0,
//         });
//       }
//       break;
//     case "year":
//       for (let i = 11; i >= 0; i--) {
//         const date = now.subtract(i, "month");
//         data.push({
//           date: date.format("MMM"),
//           fullDate: date.format("YYYY-MM"),
//           expenses: 0,
//         });
//       }
//       break;
//   }

//   return data;
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const period = searchParams.get("period") || "month";
//     const departmentId = searchParams.get("departmentId");
//     const categoryId = searchParams.get("categoryId");

//     // Get date range
//     const dateRange = getDateRange(period);

//     // Build where clause
//     const where: any = {
//       date: {
//         gte: dateRange.start,
//         lte: dateRange.end,
//       },
//     };

//     // Add filters
//     if (departmentId) where.departmentId = departmentId;
//     if (categoryId) where.categoryId = categoryId;

//     // Role-based filtering
//     if (session.user.role === "VIEWER") {
//       where.status = { in: ["APPROVED", "PAID"] };
//     }

//     // Parallel database queries for performance
//     const [
//       totalStats,
//       statusStats,
//       categoryStats,
//       departmentStats,
//       recentExpenses,
//       userStats,
//       topExpenses,
//     ] = await Promise.all([
//       // Total expense statistics
//       prisma.expense.aggregate({
//         where,
//         _sum: { amount: true },
//         _count: { id: true },
//         _avg: { amount: true },
//       }),

//       // Status-based statistics
//       prisma.expense.groupBy({
//         where,
//         by: ["status"],
//         _sum: { amount: true },
//         _count: { id: true },
//       }),

//       // Category statistics
//       prisma.expense.groupBy({
//         where,
//         by: ["categoryId"],
//         _sum: { amount: true },
//         _count: { id: true },
//       }),

//       // Department statistics
//       prisma.expense.groupBy({
//         where,
//         by: ["departmentId"],
//         _sum: { amount: true },
//         _count: { id: true },
//       }),

//       // Recent expenses
//       prisma.expense.findMany({
//         where,
//         include: {
//           category: { select: { name: true, color: true } },
//           department: { select: { name: true, color: true } },
//           createdByUser: { select: { firstName: true, lastName: true } },
//         },
//         orderBy: { date: "desc" },
//         take: 10,
//       }),

//       // User statistics
//       prisma.user.aggregate({
//         _count: { id: true },
//       }),

//       // Top expenses (highest amount)
//       prisma.expense.findMany({
//         where,
//         include: {
//           category: { select: { name: true } },
//           department: { select: { name: true } },
//         },
//         orderBy: { amount: "desc" },
//         take: 5,
//       }),
//     ]);

//     // Get category and department details
//     const [categories, departments] = await Promise.all([
//       prisma.category.findMany({
//         where: { isActive: true },
//         select: { id: true, name: true, color: true },
//       }),
//       prisma.department.findMany({
//         where: { isActive: true },
//         select: { id: true, name: true, color: true },
//       }),
//     ]);

//     // Process category stats with names
//     const processedCategoryStats = await Promise.all(
//       categoryStats.map(async (stat) => {
//         const category = categories.find((c) => c.id === stat.categoryId);
//         return {
//           categoryId: stat.categoryId,
//           categoryName: category?.name || "Unknown",
//           categoryColor: category?.color || "#6B7280",
//           totalAmount: stat._sum.amount || 0,
//           count: stat._count.id,
//         };
//       })
//     );

//     // Process department stats with names
//     const processedDepartmentStats = await Promise.all(
//       departmentStats.map(async (stat) => {
//         const department = departments.find((d) => d.id === stat.departmentId);
//         return {
//           departmentId: stat.departmentId,
//           departmentName: department?.name || "General",
//           departmentColor: department?.color || "#6B7280",
//           totalAmount: stat._sum.amount || 0,
//           count: stat._count.id,
//         };
//       })
//     );

//     // Generate chart data
//     const chartData = generateChartData(period);

//     // Populate chart data with actual expenses
//     if (chartData.length > 0) {
//       const expenseByDate = await prisma.expense.groupBy({
//         where,
//         by: period === "year" ? ["date"] : ["date"],
//         _sum: { amount: true },
//       });

//       // This is simplified - in production, you'd want to aggregate by day/month properly
//       // For now, we'll just show the total for the period
//     }

//     return NextResponse.json({
//       success: true,
//       period,
//       filters: { departmentId, categoryId },
//       summary: {
//         totalAmount: totalStats._sum.amount || 0,
//         totalCount: totalStats._count.id,
//         averageAmount: totalStats._avg.amount || 0,
//         pendingAmount:
//           statusStats.find((s) => s.status === "PENDING")?._sum.amount || 0,
//         pendingCount:
//           statusStats.find((s) => s.status === "PENDING")?._count.id || 0,
//         approvedAmount:
//           statusStats.find((s) => s.status === "APPROVED")?._sum.amount || 0,
//         approvedCount:
//           statusStats.find((s) => s.status === "APPROVED")?._count.id || 0,
//         paidAmount:
//           statusStats.find((s) => s.status === "PAID")?._sum.amount || 0,
//         paidCount: statusStats.find((s) => s.status === "PAID")?._count.id || 0,
//       },
//       categoryBreakdown: processedCategoryStats.sort(
//         (a, b) => b.totalAmount - a.totalAmount
//       ),
//       departmentBreakdown: processedDepartmentStats.sort(
//         (a, b) => b.totalAmount - a.totalAmount
//       ),
//       recentExpenses,
//       userStats: {
//         totalUsers: userStats._count.id,
//       },
//       topExpenses,
//       chartData,
//       categories,
//       departments,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Dashboard API error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch dashboard data",
//         message: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

// Helper function to get date range
function getDateRange(period: string) {
  const now = dayjs();

  switch (period) {
    case "today":
      return {
        start: now.startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
    case "week":
      return { start: now.subtract(1, "week").toDate(), end: now.toDate() };
    case "month":
      return { start: now.subtract(1, "month").toDate(), end: now.toDate() };
    case "quarter":
      return { start: now.subtract(3, "month").toDate(), end: now.toDate() };
    case "year":
      return { start: now.subtract(1, "year").toDate(), end: now.toDate() };
    default: // 'all' or custom
      return { start: dayjs("2020-01-01").toDate(), end: now.toDate() };
  }
}

// Helper to generate chart data
function generateChartData(period: string) {
  const now = dayjs();
  const data = [];

  switch (period) {
    case "today":
      // For today, show hourly data
      for (let i = 23; i >= 0; i--) {
        const date = now.subtract(i, "hour");
        data.push({
          date: date.format("HH:00"),
          fullDate: date.format("YYYY-MM-DD HH:00"),
          amount: 0,
          count: 0,
        });
      }
      break;
    case "week":
      for (let i = 6; i >= 0; i--) {
        const date = now.subtract(i, "day");
        data.push({
          date: date.format("ddd"),
          fullDate: date.format("YYYY-MM-DD"),
          amount: 0,
          count: 0,
        });
      }
      break;
    case "month":
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = now.subtract(i, "day");
        data.push({
          date: date.format("D MMM"),
          fullDate: date.format("YYYY-MM-DD"),
          amount: 0,
          count: 0,
        });
      }
      break;
    case "quarter":
      // Last 3 months by month
      for (let i = 2; i >= 0; i--) {
        const date = now.subtract(i, "month");
        data.push({
          date: date.format("MMM"),
          fullDate: date.format("YYYY-MM"),
          amount: 0,
          count: 0,
        });
      }
      break;
    case "year":
      for (let i = 11; i >= 0; i--) {
        const date = now.subtract(i, "month");
        data.push({
          date: date.format("MMM"),
          fullDate: date.format("YYYY-MM"),
          amount: 0,
          count: 0,
        });
      }
      break;
    default: // 'all'
      // For 'all', show yearly data
      const startYear = 2020;
      const currentYear = now.year();
      for (let year = startYear; year <= currentYear; year++) {
        data.push({
          date: year.toString(),
          fullDate: year.toString(),
          amount: 0,
          count: 0,
        });
      }
      break;
  }

  return data;
}

// Helper to aggregate expenses by date
async function aggregateExpensesByDate(
  where: any,
  period: string,
  chartData: any[]
) {
  try {
    // Get all expenses in the date range
    const expenses = await prisma.expense.findMany({
      where,
      select: {
        date: true,
        amount: true,
      },
      orderBy: { date: "asc" },
    });

    if (expenses.length === 0) {
      return chartData;
    }

    // Group expenses by date based on period
    const groupedExpenses: Record<string, { amount: number; count: number }> =
      {};

    expenses.forEach((expense) => {
      let key: string;

      switch (period) {
        case "year":
          // Group by month
          key = dayjs(expense.date).format("YYYY-MM");
          break;
        case "quarter":
          // Group by month
          key = dayjs(expense.date).format("YYYY-MM");
          break;
        case "month":
        case "week":
          // Group by day
          key = dayjs(expense.date).format("YYYY-MM-DD");
          break;
        case "today":
          // Group by hour
          key = dayjs(expense.date).format("YYYY-MM-DD HH:00");
          break;
        default: // 'all'
          // Group by year
          key = dayjs(expense.date).format("YYYY");
          break;
      }

      if (!groupedExpenses[key]) {
        groupedExpenses[key] = { amount: 0, count: 0 };
      }
      groupedExpenses[key].amount += expense.amount;
      groupedExpenses[key].count += 1;
    });

    // Update chart data with actual values
    return chartData.map((item) => {
      const expenseData = groupedExpenses[item.fullDate];
      if (expenseData) {
        return {
          ...item,
          amount: expenseData.amount,
          count: expenseData.count,
        };
      }
      return item;
    });
  } catch (error) {
    console.error("Error aggregating expenses:", error);
    return chartData;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const departmentId = searchParams.get("departmentId");
    const categoryId = searchParams.get("categoryId");

    // Get date range
    const dateRange = getDateRange(period);

    // Build where clause
    const where: any = {
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    };

    // Add filters
    if (departmentId && departmentId !== "all")
      where.departmentId = departmentId;
    if (categoryId && categoryId !== "all") where.categoryId = categoryId;

    // Role-based filtering
    if (session.user.role === "VIEWER") {
      where.status = { in: ["APPROVED", "PAID"] };
    }

    // Generate chart data structure
    let chartData = generateChartData(period);

    // Populate chart data with actual expenses
    chartData = await aggregateExpensesByDate(where, period, chartData);

    // Parallel database queries for performance
    const [
      totalStats,
      statusStats,
      categoryStats,
      departmentStats,
      recentExpenses,
      userStats,
      topExpenses,
    ] = await Promise.all([
      // Total expense statistics
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),

      // Status-based statistics
      prisma.expense.groupBy({
        where,
        by: ["status"],
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Category statistics
      prisma.expense.groupBy({
        where,
        by: ["categoryId"],
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Department statistics
      prisma.expense.groupBy({
        where,
        by: ["departmentId"],
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Recent expenses
      prisma.expense.findMany({
        where,
        include: {
          category: { select: { name: true, color: true } },
          department: { select: { name: true, color: true } },
          createdByUser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { date: "desc" },
        take: 10,
      }),

      // User statistics
      prisma.user.aggregate({
        _count: { id: true },
      }),

      // Top expenses (highest amount)
      prisma.expense.findMany({
        where,
        include: {
          category: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { amount: "desc" },
        take: 5,
      }),
    ]);

    // Get category and department details
    const [categories, departments] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, color: true },
      }),
      prisma.department.findMany({
        where: { isActive: true },
        select: { id: true, name: true, color: true },
      }),
    ]);

    // Process category stats with names
    const processedCategoryStats = await Promise.all(
      categoryStats.map(async (stat) => {
        const category = categories.find((c) => c.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          categoryColor: category?.color || "#6B7280",
          totalAmount: stat._sum.amount || 0,
          count: stat._count.id,
        };
      })
    );

    // Process department stats with names
    const processedDepartmentStats = await Promise.all(
      departmentStats.map(async (stat) => {
        const department = departments.find((d) => d.id === stat.departmentId);
        return {
          departmentId: stat.departmentId,
          departmentName: department?.name || "General",
          departmentColor: department?.color || "#6B7280",
          totalAmount: stat._sum.amount || 0,
          count: stat._count.id,
        };
      })
    );

    // Calculate chart total for summary
    const chartTotalAmount = chartData.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const chartTotalCount = chartData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    return NextResponse.json({
      success: true,
      period,
      filters: { departmentId, categoryId },
      summary: {
        totalAmount: totalStats._sum.amount || 0,
        totalCount: totalStats._count.id,
        averageAmount: totalStats._avg.amount || 0,
        pendingAmount:
          statusStats.find((s) => s.status === "PENDING")?._sum.amount || 0,
        pendingCount:
          statusStats.find((s) => s.status === "PENDING")?._count.id || 0,
        approvedAmount:
          statusStats.find((s) => s.status === "APPROVED")?._sum.amount || 0,
        approvedCount:
          statusStats.find((s) => s.status === "APPROVED")?._count.id || 0,
        paidAmount:
          statusStats.find((s) => s.status === "PAID")?._sum.amount || 0,
        paidCount: statusStats.find((s) => s.status === "PAID")?._count.id || 0,
        chartTotalAmount,
        chartTotalCount,
      },
      categoryBreakdown: processedCategoryStats.sort(
        (a, b) => b.totalAmount - a.totalAmount
      ),
      departmentBreakdown: processedDepartmentStats.sort(
        (a, b) => b.totalAmount - a.totalAmount
      ),
      recentExpenses,
      userStats: {
        totalUsers: userStats._count.id,
      },
      topExpenses,
      chartData,
      categories,
      departments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
