import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface ExpenseFilterState {
  search: string;
  category: string;
  paymentMethod: string;
  sortBy: SortBy;
  startDate: string;
  endDate: string;
}

const initialState: ExpenseFilterState = {
  search: '',
  category: '',
  paymentMethod: '',
  sortBy: 'date-desc',
  startDate: '',
  endDate: '',
};

const expenseFilterSlice = createSlice({
  name: 'expenseFilter',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setSortBy,
  setStartDate,
  setEndDate,
  resetFilters,
} = expenseFilterSlice.actions;

export default expenseFilterSlice.reducer;
