import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
import inventoryReducer from "./slices/inventorySlice";
import salesReducer from "./slices/salesSlice";
import customersReducer from "./slices/customersSlice";
import suppliersReducer from "./slices/suppliersSlice";
import productsReducer from "./slices/productsSlice";
import employeesReducer from "./slices/employeesSlice";
import financeReducer from "./slices/financeSlice";
import notificationsReducer from "./slices/notificationsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    inventory: inventoryReducer,
    sales: salesReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    products: productsReducer,
    employees: employeesReducer,
    finance: financeReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
