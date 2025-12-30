import { hash } from "bcryptjs";
import { prisma } from "../prisma";
import { ExpenseStatus, PaymentMethod, UserRole } from "@/generated/prisma";

async function main() {
  console.log("🌱 Starting database seeding with departments...");

  try {
    // Clear existing data
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Cleared existing data");

    // Hash password
    const hashedPassword = await hash("password123", 12);

    // Create departments
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          name: "Information Technology",
          code: "IT",
          description: "IT infrastructure and support",
          color: "#3B82F6",
          icon: "cpu",
          budget: 50000,
        },
      }),
      prisma.department.create({
        data: {
          name: "Human Resources",
          code: "HR",
          description: "People and culture",
          color: "#10B981",
          icon: "users",
          budget: 30000,
        },
      }),
      prisma.department.create({
        data: {
          name: "Sales & Marketing",
          code: "SALES",
          description: "Sales and marketing activities",
          color: "#EF4444",
          icon: "trending-up",
          budget: 75000,
        },
      }),
      prisma.department.create({
        data: {
          name: "Finance",
          code: "FINANCE",
          description: "Financial operations",
          color: "#8B5CF6",
          icon: "dollar-sign",
          budget: 40000,
        },
      }),
      prisma.department.create({
        data: {
          name: "Operations",
          code: "OPS",
          description: "General operations",
          color: "#F59E0B",
          icon: "settings",
          budget: 45000,
        },
      }),
    ]);

    console.log(`🏢 Created ${departments.length} departments`);

    // Create admin user (assign to IT department)
    const admin = await prisma.user.create({
      data: {
        email: "admin@xenfi.com",
        firstName: "Admin",
        lastName: "User",
        password: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true,
        departmentId: departments[0].id, // IT department
      },
    });

    // Create manager user (assign to Sales department)
    const manager = await prisma.user.create({
      data: {
        email: "manager@xenfi.com",
        firstName: "Manager",
        lastName: "User",
        password: hashedPassword,
        role: UserRole.MANAGER,
        isVerified: true,
        departmentId: departments[2].id, // Sales department
      },
    });

    // Create staff user (assign to HR department)
    const staff = await prisma.user.create({
      data: {
        email: "staff@xenfi.com",
        firstName: "Staff",
        lastName: "User",
        password: hashedPassword,
        role: UserRole.STAFF,
        isVerified: true,
        departmentId: departments[1].id, // HR department
      },
    });

    // Create viewer user (no department assigned)
    const viewer = await prisma.user.create({
      data: {
        email: "viewer@xenfi.com",
        firstName: "Viewer",
        lastName: "User",
        password: hashedPassword,
        role: UserRole.VIEWER,
        isVerified: true,
        // No department assigned
      },
    });

    console.log(`👥 Created 4 users with different roles`);

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Office Supplies",
          description: "Pens, paper, printer ink, etc.",
          color: "#3B82F6",
          icon: "briefcase",
          createdBy: admin.id,
        },
      }),
      prisma.category.create({
        data: {
          name: "Travel & Accommodation",
          description: "Business trips, flights, hotels",
          color: "#10B981",
          icon: "plane",
          createdBy: admin.id,
        },
      }),
      prisma.category.create({
        data: {
          name: "Software & Subscriptions",
          description: "SaaS tools, licenses, subscriptions",
          color: "#8B5CF6",
          icon: "code",
          createdBy: admin.id,
        },
      }),
      prisma.category.create({
        data: {
          name: "Meals & Entertainment",
          description: "Client meetings, team lunches",
          color: "#F59E0B",
          icon: "utensils",
          createdBy: admin.id,
        },
      }),
      prisma.category.create({
        data: {
          name: "Utilities",
          description: "Internet, electricity, water",
          color: "#EF4444",
          icon: "zap",
          createdBy: admin.id,
        },
      }),
    ]);

    console.log(`📂 Created ${categories.length} categories`);

    // Create sample expenses with departments
    const expenses = await Promise.all([
      // IT department expense
      prisma.expense.create({
        data: {
          amount: 25000,
          description: "Printer ink cartridges for IT office",
          date: new Date("2024-01-15"),
          categoryId: categories[0].id,
          departmentId: departments[0].id, // IT department
          paymentMethod: PaymentMethod.CARD,
          status: ExpenseStatus.APPROVED,
          createdBy: admin.id,
        },
      }),
      // Sales department expense
      prisma.expense.create({
        data: {
          amount: 1200000,
          description: "Flight to Nairobi conference for sales team",
          date: new Date("2024-01-20"),
          categoryId: categories[1].id,
          departmentId: departments[2].id, // Sales department
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          status: ExpenseStatus.PAID,
          createdBy: manager.id,
        },
      }),
      // IT department expense
      prisma.expense.create({
        data: {
          amount: 30000,
          description: "Figma subscription for design team",
          date: new Date("2024-01-10"),
          categoryId: categories[2].id,
          departmentId: departments[0].id, // IT department
          paymentMethod: PaymentMethod.CARD,
          status: ExpenseStatus.APPROVED,
          createdBy: admin.id,
        },
      }),
      // HR department expense
      prisma.expense.create({
        data: {
          amount: 50000,
          description: "Team lunch for HR onboarding",
          date: new Date("2024-01-25"),
          categoryId: categories[3].id,
          departmentId: departments[1].id, // HR department
          paymentMethod: PaymentMethod.CASH,
          status: ExpenseStatus.PENDING,
          createdBy: staff.id,
        },
      }),
      // General expense (no department)
      prisma.expense.create({
        data: {
          amount: 70000,
          description: "Monthly internet bill for main office",
          date: new Date("2024-01-05"),
          categoryId: categories[4].id,
          // No department assigned (general expense)
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          status: ExpenseStatus.APPROVED,
          createdBy: admin.id,
        },
      }),
      // Finance department expense
      prisma.expense.create({
        data: {
          amount: 45000,
          description: "Accounting software license renewal",
          date: new Date("2024-01-12"),
          categoryId: categories[2].id,
          departmentId: departments[3].id, // Finance department
          paymentMethod: PaymentMethod.CARD,
          status: ExpenseStatus.APPROVED,
          createdBy: admin.id,
        },
      }),
    ]);

    console.log(
      `💰 Created ${expenses.length} sample expenses with department assignments`
    );
    console.log("✅ Database seeding completed!");

    console.log("\n📋 Login credentials:");
    console.log("====================");
    console.log("Admin:");
    console.log(`  Email: admin@xenfi.com`);
    console.log(`  Password: password123`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Department: ${departments[0].name}`);
    console.log("\nManager:");
    console.log(`  Email: manager@xenfi.com`);
    console.log(`  Password: password123`);
    console.log(`  Role: ${manager.role}`);
    console.log(`  Department: ${departments[2].name}`);
    console.log("\nStaff:");
    console.log(`  Email: staff@xenfi.com`);
    console.log(`  Password: password123`);
    console.log(`  Role: ${staff.role}`);
    console.log(`  Department: ${departments[1].name}`);
    console.log("\nViewer:");
    console.log(`  Email: viewer@xenfi.com`);
    console.log(`  Password: password123`);
    console.log(`  Role: ${viewer.role}`);
    console.log(`  Department: None (General)`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
