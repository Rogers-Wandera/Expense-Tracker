"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Spinner,
  CardHeader,
} from "@heroui/react";
import { IconRefresh, IconFilter, IconReceipt } from "@tabler/icons-react";
import { StatsCarousel } from "@/components/dashboard/stats-carousel";
import { ExpenseLineChart } from "@/components/dashboard/expense-chart";
import { BreakdownCards } from "@/components/dashboard/breakdown-cards";
import { useSession } from "next-auth/react";
import { RecentExpensesTable } from "@/components/dashboard/recent-expenses";

interface DashboardData {
  summary: any;
  categoryBreakdown: any[];
  departmentBreakdown: any[];
  recentExpenses: any[];
  chartData: any[];
  categories: any[];
  departments: any[];
  period: string;
  filters: any;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("month");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(departmentId && { departmentId }),
        ...(categoryId && { categoryId }),
      });

      const response = await fetch(`/api/dashboard?${params}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        console.error("Failed to fetch dashboard data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [period, departmentId, categoryId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const allDeps = useMemo(() => {
    const cats: { key: string; label: string }[] = [
      { key: "all", label: "All Departments" },
    ];
    if (data && data?.departments?.length > 0) {
      cats.push(
        ...data.departments.map((c) => ({
          key: c.id,
          label: c.name,
        }))
      );
    }
    return cats;
  }, [data?.departments]);

  const allCats = useMemo(() => {
    const cats: { key: string; label: string }[] = [
      { key: "all", label: "All Categories" },
    ];
    if (data && data?.categories?.length > 0) {
      cats.push(
        ...data.categories.map((c) => ({
          key: c.id,
          label: c.name,
        }))
      );
    }
    return cats;
  }, [data?.categories]);

  const handleFilterReset = () => {
    setPeriod("month");
    setDepartmentId(null);
    setCategoryId(null);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {session?.user?.firstName}. Here's what's happening
            with your expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="flat"
            size="sm"
            startContent={<IconRefresh className="w-4 h-4" />}
            onPress={fetchDashboardData}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Time Period"
              placeholder="Select period"
              selectedKeys={[period]}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <SelectItem key="today">Today</SelectItem>
              <SelectItem key="week">Last 7 days</SelectItem>
              <SelectItem key="month">Last 30 days</SelectItem>
              <SelectItem key="quarter">Last Quarter</SelectItem>
              <SelectItem key="year">Last Year</SelectItem>
              <SelectItem key="all">All Time</SelectItem>
            </Select>

            <Select
              label="Department"
              placeholder="All Departments"
              selectedKeys={departmentId ? [departmentId] : []}
              onChange={(e) => setDepartmentId(e.target.value || null)}
              items={allDeps}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Select
              label="Category"
              placeholder="All Categories"
              selectedKeys={categoryId ? [categoryId] : []}
              onChange={(e) => setCategoryId(e.target.value || null)}
              items={allCats}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="light"
              size="sm"
              onPress={handleFilterReset}
              startContent={<IconFilter className="w-4 h-4" />}
            >
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats Carousel */}
      {data?.summary && <StatsCarousel stats={data.summary} />}

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data?.chartData && data?.categories && (
            <ExpenseLineChart data={data.chartData} />
          )}
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <IconReceipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  At a glance
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Expenses
                </span>
                <span className="font-semibold">
                  {data?.summary?.totalCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg. Expense
                </span>
                <span className="font-semibold">
                  UGX {data?.summary?.averageAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Approval Rate
                </span>
                <span className="font-semibold text-green-600">
                  {data?.summary?.totalCount
                    ? Math.round(
                        ((data.summary.approvedCount + data.summary.paidCount) /
                          data.summary.totalCount) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Period</span>
                <span className="font-semibold capitalize">{period}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Breakdown Cards */}
      {data?.categoryBreakdown && data?.departmentBreakdown && (
        <BreakdownCards
          categoryBreakdown={data.categoryBreakdown}
          departmentBreakdown={data.departmentBreakdown}
        />
      )}

      {/* Recent Expenses */}
      {data?.recentExpenses && (
        <RecentExpensesTable expenses={data.recentExpenses} />
      )}
    </div>
  );
}
