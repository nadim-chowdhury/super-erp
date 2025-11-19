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
    bulkDeleteTransactions: (state, action: PayloadAction<string[]>) => {
      const transactionsToDelete = state.transactions.filter((t) =>
        action.payload.includes(t.id)
      );
      transactionsToDelete.forEach((transaction) => {
        if (transaction.type === "income") {
          state.summary.totalIncome -= transaction.amount;
        } else {
          state.summary.totalExpenses -= transaction.amount;
        }
      });
      state.summary.netProfit =
        state.summary.totalIncome - state.summary.totalExpenses;
      state.transactions = state.transactions.filter(
        (t) => !action.payload.includes(t.id)
      );
    },
    bulkUpdateTransactions: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Transaction> }>
    ) => {
      state.transactions = state.transactions.map((t) => {
        if (action.payload.ids.includes(t.id)) {
          const updated = { ...t, ...action.payload.updates };
          // Update summary if amount or type changed
          if (
            action.payload.updates.amount !== undefined ||
            action.payload.updates.type !== undefined
          ) {
            if (t.type === "income") {
              state.summary.totalIncome -= t.amount;
            } else {
              state.summary.totalExpenses -= t.amount;
            }
            if (updated.type === "income") {
              state.summary.totalIncome += updated.amount;
            } else {
              state.summary.totalExpenses += updated.amount;
            }
            state.summary.netProfit =
              state.summary.totalIncome - state.summary.totalExpenses;
          }
          return updated;
        }
        return t;
      });
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Transaction["status"] }>
    ) => {
      state.transactions = state.transactions.map((t) =>
        action.payload.ids.includes(t.id)
          ? {
              ...t,
              status: action.payload.status,
            }
          : t
      );
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
  bulkDeleteTransactions,
  bulkUpdateTransactions,
  bulkUpdateStatus,
} = financeSlice.actions;
export default financeSlice.reducer;
