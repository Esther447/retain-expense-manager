export type PaymentMethod = 'cash' | 'mobile-money' | 'card' | 'bank';

export interface Expense {
  id: number;
  user_id?: number;
  title: string;
  amount: number;
  category_id: number;
  category_name: string;
  expense_date: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: Category[];
}
