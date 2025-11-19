import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/lib/data/demoData";

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  filters: {
    status: string;
    search: string;
  };
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  filters: {
    status: "all",
    search: "",
  },
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<CustomersState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    bulkDeleteCustomers: (state, action: PayloadAction<string[]>) => {
      state.customers = state.customers.filter(
        (c) => !action.payload.includes(c.id)
      );
    },
    bulkUpdateCustomers: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Customer> }>
    ) => {
      state.customers = state.customers.map((c) =>
        action.payload.ids.includes(c.id)
          ? { ...c, ...action.payload.updates }
          : c
      );
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Customer["status"] }>
    ) => {
      state.customers = state.customers.map((c) =>
        action.payload.ids.includes(c.id)
          ? {
              ...c,
              status: action.payload.status,
            }
          : c
      );
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  setFilters,
  bulkDeleteCustomers,
  bulkUpdateCustomers,
  bulkUpdateStatus,
} = customersSlice.actions;
export default customersSlice.reducer;
