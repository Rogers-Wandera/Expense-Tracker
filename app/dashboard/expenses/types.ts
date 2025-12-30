export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  category?: { name: string; color: string };
  department?: { name: string; color: string };
  createdByUser?: { firstName: string; lastName: string; email: string };
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
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

export interface ExpensesResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    pagination: PaginationData;
    summary: Summary;
  };
}
