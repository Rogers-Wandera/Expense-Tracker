import { Card, CardBody } from "@heroui/react";
import {
  IconCategory,
  IconClock,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { Expense } from "./types";

type Props = {
  expenses: Expense[];
  summary: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
  };
};
const ExpenseStats = ({ expenses, summary }: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardBody className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Expenses
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(summary.totalAmount)}
            </h3>
            <p className="text-sm text-gray-500">
              {summary.totalCount} expenses
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconCurrencyDollar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Expense
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(summary.averageAmount)}
            </h3>
            <p className="text-sm text-gray-500">Per transaction</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <IconCategory className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending Approval
            </p>
            <h3 className="text-2xl font-bold">
              {expenses.filter((e) => e.status === "PENDING").length}
            </h3>
            <p className="text-sm text-gray-500">Awaiting review</p>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <IconClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ExpenseStats;
