export interface Expense {
  id: number;
  title: string;
  amount: number;
  category_id: number;
  category_name: string;
  expense_date: string;
  payment_method: string;
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
}
