export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  department?: {
    name: string;
    color?: string;
  };
  imageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  isLocked: boolean;
  lastLoginDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Summary {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  roleDistribution: {
    role: string;
    _count: number;
  }[];
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: PaginationData;
    summary: Summary;
  };
}

export interface Department {
  id: string;
  name: string;
  color?: string;
}
