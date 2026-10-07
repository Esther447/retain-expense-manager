import { configureStore } from '@reduxjs/toolkit';
import expenseFilterReducer from './expenseFilterSlice';

export const store = configureStore({
  reducer: {
    expenseFilter: expenseFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
