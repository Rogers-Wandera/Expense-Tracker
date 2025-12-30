import {
  Button,
  Card,
  CardBody,
  DatePicker,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  IconChevronRight,
  IconChevronUp,
  IconFilter,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { SetStateAction } from "react";
import dayjs from "dayjs";
import { parseDate } from "@internationalized/date";

export type Props = {
  handleFilterChange: (key: string, value: string) => void;
  setShowAdvancedFilters: (value: SetStateAction<boolean>) => void;
  fetchExpenses: () => Promise<void> | void;
  handleResetFilters: () => void;
  showAdvancedFilters: boolean;
  filters: {
    status: string;
    categoryId: string;
    departmentId: string;
    startDate: string;
    endDate: string;
    search: string;
  };
  allCats: {
    key: string;
    label: string;
  }[];
  allDeps: {
    key: string;
    label: string;
  }[];
  loading: boolean;
};

const ExpenseFilters = ({
  handleFilterChange,
  setShowAdvancedFilters,
  fetchExpenses,
  showAdvancedFilters,
  filters,
  allCats,
  allDeps,
  loading,
  handleResetFilters,
}: Props) => {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Search Expenses"
              placeholder="Search by description, amount, or user..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              startContent={<IconSearch className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
              startContent={
                showAdvancedFilters ? (
                  <IconChevronUp className="w-4 h-4" />
                ) : (
                  <IconChevronRight className="w-4 h-4" />
                )
              }
            >
              {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              variant="light"
              onPress={fetchExpenses}
              startContent={<IconRefresh className="w-4 h-4" />}
              isLoading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[filters.status]}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="DRAFT">Draft</SelectItem>
                <SelectItem key="PENDING">Pending</SelectItem>
                <SelectItem key="APPROVED">Approved</SelectItem>
                <SelectItem key="REJECTED">Rejected</SelectItem>
                <SelectItem key="PAID">Paid</SelectItem>
              </Select>

              <Select
                label="Category"
                placeholder="All Categories"
                selectedKeys={[filters.categoryId]}
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
                items={allCats}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>

              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[filters.departmentId]}
                onChange={(e) =>
                  handleFilterChange("departmentId", e.target.value)
                }
                items={allDeps}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={filters.startDate ? parseDate(filters.startDate) : null}
                onChange={(date) =>
                  handleFilterChange(
                    "startDate",
                    date ? dayjs(date.toString()).format("YYYY-MM-DD") : ""
                  )
                }
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? parseDate(filters.endDate) : null}
                onChange={(date) =>
                  handleFilterChange(
                    "endDate",
                    date ? dayjs(date.toString()).format("YYYY-MM-DD") : ""
                  )
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="light"
                onPress={handleResetFilters}
                startContent={<IconFilter className="w-4 h-4" />}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ExpenseFilters;
