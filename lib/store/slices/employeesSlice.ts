import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee } from "@/lib/data/demoData";

interface EmployeesState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  filters: {
    department: string;
    status: string;
    search: string;
  };
}

const initialState: EmployeesState = {
  employees: [],
  selectedEmployee: null,
  filters: {
    department: "all",
    status: "all",
    search: "",
  },
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter((e) => e.id !== action.payload);
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<EmployeesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    bulkDeleteEmployees: (state, action: PayloadAction<string[]>) => {
      state.employees = state.employees.filter(
        (e) => !action.payload.includes(e.id)
      );
    },
    bulkUpdateEmployees: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Employee> }>
    ) => {
      state.employees = state.employees.map((e) =>
        action.payload.ids.includes(e.id)
          ? { ...e, ...action.payload.updates }
          : e
      );
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Employee["status"] }>
    ) => {
      state.employees = state.employees.map((e) =>
        action.payload.ids.includes(e.id)
          ? {
              ...e,
              status: action.payload.status,
            }
          : e
      );
    },
  },
});

export const {
  setEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setSelectedEmployee,
  setFilters,
  bulkDeleteEmployees,
  bulkUpdateEmployees,
  bulkUpdateStatus,
} = employeesSlice.actions;
export default employeesSlice.reducer;
