import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  };
  recentOrders: any[];
  topProducts: any[];
  salesChart: { date: string; sales: number }[];
}

const initialState: DashboardState = {
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  },
  recentOrders: [],
  topProducts: [],
  salesChart: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardState["stats"]>) => {
      state.stats = action.payload;
    },
    setRecentOrders: (state, action: PayloadAction<any[]>) => {
      state.recentOrders = action.payload;
    },
    setTopProducts: (state, action: PayloadAction<any[]>) => {
      state.topProducts = action.payload;
    },
    setSalesChart: (
      state,
      action: PayloadAction<{ date: string; sales: number }[]>
    ) => {
      state.salesChart = action.payload;
    },
  },
});

export const { setStats, setRecentOrders, setTopProducts, setSalesChart } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
