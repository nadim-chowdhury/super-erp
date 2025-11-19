import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "@/lib/data/demoData";

interface FinanceState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  filters: {
    type: string;
    category: string;
    status: string;
    dateRange: { start: string; end: string };
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

const initialState: FinanceState = {
  transactions: [],
  selectedTransaction: null,
  filters: {
    type: "all",
    category: "all",
    status: "all",
    dateRange: { start: "", end: "" },
  },
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  },
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      // Calculate summary
      const income = action.payload
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = action.payload
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      state.summary = {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
      };
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      // Update summary
      if (action.payload.type === "income") {
        state.summary.totalIncome += action.payload.amount;
      } else {
        state.summary.totalExpenses += action.payload.amount;
      }
      state.summary.netProfit =
        state.summary.totalIncome - state.summary.totalExpenses;
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(
        (t) => t.id === action.payload.id
      );
      if (index !== -1) {
        const old = state.transactions[index];
        // Update summary
        if (old.type === "income") {
          state.summary.totalIncome -= old.amount;
        } else {
          state.summary.totalExpenses -= old.amount;
        }
        if (action.payload.type === "income") {
          state.summary.totalIncome += action.payload.amount;
        } else {
          state.summary.totalExpenses += action.payload.amount;
        }
        state.summary.netProfit =
          state.summary.totalIncome - state.summary.totalExpenses;
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find(
        (t) => t.id === action.payload
      );
      if (transaction) {
        // Update summary
        if (transaction.type === "income") {
          state.summary.totalIncome -= transaction.amount;
        } else {
          state.summary.totalExpenses -= transaction.amount;
        }
        state.summary.netProfit =
          state.summary.totalIncome - state.summary.totalExpenses;
      }
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },
    setSelectedTransaction: (
      state,
      action: PayloadAction<Transaction | null>
    ) => {
      state.selectedTransaction = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<FinanceState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setSelectedTransaction,
  setFilters,
} = financeSlice.actions;
export default financeSlice.reducer;
