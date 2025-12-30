"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Avatar,
  Badge,
} from "@heroui/react";
import {
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCurrencyDollar,
  IconEdit,
  IconEye,
  IconTrash,
  IconX,
  IconBuilding,
  IconUser,
  IconLock,
  IconLockOpen,
  IconShield,
  IconShieldCheck,
  IconMail,
  IconCalendar,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { User, PaginationData } from "./types";

type Props = {
  loading: boolean;
  users: User[];
  session: Session | null;
  handleEdit: (user: User) => void;
  handleDeleteClick: (id: string) => void;
  handleUpdateStatus: (
    id: string,
    action: string,
    value: boolean
  ) => Promise<void>;
  handlePageChange: (page: number) => void;
  pagination: PaginationData;
};

const UserTable = ({
  loading,
  users,
  session,
  handleEdit,
  handleDeleteClick,
  handleUpdateStatus,
  handlePageChange,
  pagination,
}: Props) => {
  const router = useRouter();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MANAGER":
        return "warning";
      case "STAFF":
        return "primary";
      case "VIEWER":
        return "default";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <IconShield className="w-3 h-3" />;
      case "MANAGER":
        return <IconShieldCheck className="w-3 h-3" />;
      case "STAFF":
      case "VIEWER":
        return <IconUser className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const formatDateTime = (date: string) => {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  return (
    <Card className="border-none shadow-sm">
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <Table
            aria-label="Users table"
            removeWrapper
            classNames={{
              base: "min-w-full",
              th: "px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800",
              td: "px-4 py-3 whitespace-nowrap",
              tr: "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
            }}
            bottomContent={
              <div className="flex w-full justify-center py-4">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={pagination.page}
                  total={pagination.totalPages}
                  onChange={handlePageChange}
                  size="sm"
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn className="w-40">USER</TableColumn>
              <TableColumn className="w-25">ROLE</TableColumn>
              <TableColumn className="w-35">DEPARTMENT</TableColumn>
              <TableColumn className="w-25">STATUS</TableColumn>
              <TableColumn className="w-35">LAST LOGIN</TableColumn>
              <TableColumn className="w-35">CREATED</TableColumn>
              <TableColumn className="w-25 text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<Spinner size="sm" />}
              emptyContent={
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              }
            >
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="md"
                        name={getUserInitials(user.firstName, user.lastName)}
                        src={user.imageUrl || undefined}
                        classNames={{
                          base: "w-10 h-10 text-sm",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-32.5">
                          {user.firstName} {user.lastName}
                        </p>
                        <div className="flex items-center gap-1">
                          <IconMail className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500 truncate max-w-32.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getRoleColor(user.role)}
                      variant="flat"
                      startContent={getRoleIcon(user.role)}
                      classNames={{
                        content: "text-xs font-medium px-1",
                      }}
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<IconBuilding className="w-3 h-3" />}
                      >
                        <span
                          className="truncate max-w-25"
                          title={user.department.name}
                        >
                          {user.department.name}
                        </span>
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat" color="default">
                        No Department
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          color={user.isActive ? "success" : "danger"}
                          variant="flat"
                          className="border-none"
                        >
                          <div className="flex items-center gap-1">
                            {user.isActive ? (
                              <IconToggleRight className="w-3 h-3" />
                            ) : (
                              <IconToggleLeft className="w-3 h-3" />
                            )}
                            <span className="text-xs">
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </Badge>
                        {user.isLocked && (
                          <Badge
                            size="sm"
                            color="warning"
                            variant="flat"
                            className="border-none"
                          >
                            <div className="flex items-center gap-1">
                              <IconLock className="w-3 h-3" />
                              <span className="text-xs">Locked</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                      {!user.isVerified && (
                        <Badge
                          size="sm"
                          color="default"
                          variant="flat"
                          className="border-none"
                        >
                          <div className="flex items-center gap-1">
                            <IconClock className="w-3 h-3" />
                            <span className="text-xs">Unverified</span>
                          </div>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginDate ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(user.lastLoginDate)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        Never logged in
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="View Details">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="min-w-8 w-8 h-8"
                          onPress={() =>
                            router.push(`/dashboard/users/${user.id}`)
                          }
                        >
                          <IconEye className="w-4 h-4" />
                        </Button>
                      </Tooltip>

                      <Tooltip content="Edit">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="min-w-8 w-8 h-8"
                          onPress={() => handleEdit(user)}
                        >
                          <IconEdit className="w-4 h-4" />
                        </Button>
                      </Tooltip>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="min-w-8 w-8 h-8"
                          >
                            <IconChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User actions">
                          {/* Activate/Deactivate */}
                          <DropdownItem
                            key={user.isActive ? "deactivate" : "activate"}
                            onPress={() =>
                              handleUpdateStatus(
                                user.id,
                                "activate",
                                !user.isActive
                              )
                            }
                            className={
                              user.isActive ? "text-warning" : "text-success"
                            }
                            startContent={
                              user.isActive ? (
                                <IconToggleLeft className="w-4 h-4" />
                              ) : (
                                <IconToggleRight className="w-4 h-4" />
                              )
                            }
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownItem>

                          {/* Lock/Unlock */}
                          <DropdownItem
                            key={user.isLocked ? "unlock" : "lock"}
                            onPress={() =>
                              handleUpdateStatus(
                                user.id,
                                "lock",
                                !user.isLocked
                              )
                            }
                            className={
                              user.isLocked ? "text-success" : "text-warning"
                            }
                            startContent={
                              user.isLocked ? (
                                <IconLockOpen className="w-4 h-4" />
                              ) : (
                                <IconLock className="w-4 h-4" />
                              )
                            }
                          >
                            {user.isLocked ? "Unlock" : "Lock"}
                          </DropdownItem>

                          {/* Verify/Unverify */}
                          {!user.isVerified ? (
                            <DropdownItem
                              key="verify"
                              onPress={() =>
                                handleUpdateStatus(user.id, "verify", true)
                              }
                              className="text-success"
                              startContent={<IconCheck className="w-4 h-4" />}
                            >
                              Mark as Verified
                            </DropdownItem>
                          ) : null}

                          {/* Divider */}
                          <DropdownItem
                            key="divider1"
                            isReadOnly
                            className="h-px bg-gray-200 my-1"
                          />

                          {/* Delete (only if not current user) */}
                          {user.id !== session?.user?.id ? (
                            <DropdownItem
                              key="delete"
                              onPress={() => handleDeleteClick(user.id)}
                              className="text-danger"
                              startContent={<IconTrash className="w-4 h-4" />}
                            >
                              Delete User
                            </DropdownItem>
                          ) : null}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserTable;
