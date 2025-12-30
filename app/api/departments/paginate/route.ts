import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: any = {};

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply status filter
    if (isActive && isActive !== "all") {
      where.isActive = isActive === "true";
    }

    // Get total count for pagination
    const totalCount = await prisma.department.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Get departments with pagination
    const departments = await prisma.department.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        budget: true,
        color: true,
        icon: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        departments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get departments paginated error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
