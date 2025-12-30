"use client";

import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react";

interface FilterProps {
  handleFilterChange: (key: string, value: string) => void;
  handleResetFilters: () => void;
  filters: {
    role: string;
    departmentId: string;
    search: string;
    isActive: string;
  };
  allRoles: { key: string; label: string }[];
  allDeps: { key: string; label: string }[];
  setShowAdvancedFilters: (value: boolean) => void;
  loading: boolean;
  fetchUsers: () => void;
  showAdvancedFilters: boolean;
}

const UserFilters = ({
  handleFilterChange,
  handleResetFilters,
  filters,
  allRoles,
  allDeps,
  setShowAdvancedFilters,
  loading,
  fetchUsers,
  showAdvancedFilters,
}: FilterProps) => {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Search Users"
              placeholder="Search by name, email..."
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
              onPress={fetchUsers}
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
                label="Role"
                placeholder="All Roles"
                selectedKeys={[filters.role]}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                {allRoles.map((role) => (
                  <SelectItem key={role.key}>{role.label}</SelectItem>
                ))}
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

              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[filters.isActive]}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="true">Active</SelectItem>
                <SelectItem key="false">Inactive</SelectItem>
              </Select>
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

export default UserFilters;
