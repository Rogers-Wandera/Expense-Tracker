"use client";

import { Card, CardBody, CardHeader, Progress } from "@heroui/react";
import { IconCategory, IconBuilding } from "@tabler/icons-react";

interface BreakdownCardsProps {
  categoryBreakdown: Array<{
    categoryName: string;
    totalAmount: number;
    count: number;
    categoryColor: string;
  }>;
  departmentBreakdown: Array<{
    departmentName: string;
    totalAmount: number;
    count: number;
    departmentColor: string;
  }>;
}

export function BreakdownCards({
  categoryBreakdown,
  departmentBreakdown,
}: BreakdownCardsProps) {
  // Format UGX currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate percentages
  const totalCategoryAmount = categoryBreakdown.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );
  const totalDepartmentAmount = departmentBreakdown.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const processedCategories = categoryBreakdown.map((item) => ({
    ...item,
    percentage:
      totalCategoryAmount > 0
        ? (item.totalAmount / totalCategoryAmount) * 100
        : 0,
  }));

  const processedDepartments = departmentBreakdown.map((item) => ({
    ...item,
    percentage:
      totalDepartmentAmount > 0
        ? (item.totalAmount / totalDepartmentAmount) * 100
        : 0,
  }));

  // If no data, show empty states
  if (categoryBreakdown.length === 0 && departmentBreakdown.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IconCategory className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">By Category</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No category data available
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No expenses categorized yet
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IconBuilding className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">By Department</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No department data available
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No department expenses yet
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Categories Breakdown */}
      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <IconCategory className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">By Category</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categoryBreakdown.length > 0
                ? "Spending distribution"
                : "No category data"}
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {processedCategories.length > 0 ? (
            processedCategories.slice(0, 5).map((item) => (
              <div key={item.categoryName} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: item.categoryColor || "#6B7280",
                      }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-30">
                      {item.categoryName || "Uncategorized"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.count} expenses
                    </p>
                  </div>
                </div>
                <Progress
                  value={item.percentage}
                  color="primary"
                  size="sm"
                  className="max-w-full"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No category data available
            </div>
          )}
        </CardBody>
      </Card>

      {/* Departments Breakdown */}
      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <IconBuilding className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">By Department</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {departmentBreakdown.length > 0
                ? "Departmental spending"
                : "No department data"}
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {processedDepartments.length > 0 ? (
            processedDepartments.slice(0, 5).map((item) => (
              <div key={item.departmentName} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: item.departmentColor || "#6B7280",
                      }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-30">
                      {item.departmentName || "General"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.count} expenses
                    </p>
                  </div>
                </div>
                <Progress
                  value={item.percentage}
                  color="success"
                  size="sm"
                  className="max-w-full"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No department data available
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
