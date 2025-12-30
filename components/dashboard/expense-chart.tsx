"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { IconChartLine } from "@tabler/icons-react";

interface ChartData {
  date: string;
  amount: number;
  count: number;
}

interface ExpenseLineChartProps {
  data: ChartData[];
}

export function ExpenseLineChart({ data }: ExpenseLineChartProps) {
  // Custom tooltip for UGX
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Amount:{" "}
            <span className="font-semibold">
              UGX {payload[0].value.toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Expenses:{" "}
            <span className="font-semibold">{payload[0].payload.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values in UGX (thousands)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `UGX ${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `UGX ${(value / 1000).toFixed(0)}K`;
    return `UGX ${value}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <IconChartLine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Expense Trends</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daily spending overview (UGX)
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorAmount)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Daily Expenses (UGX)
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
