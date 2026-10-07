import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ExpenseFilterState {
  search: string;
  category: string;
  paymentMethod: string;
  sortBy: string;
}

const initialState: ExpenseFilterState = {
  search: '',
  category: '',
  paymentMethod: '',
  sortBy: 'date-desc',
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

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setSortBy,
} = expenseFilterSlice.actions;

export default expenseFilterSlice.reducer;
