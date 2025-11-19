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
  revenueTrends: { date: string; revenue: number; profit: number }[];
  salesByCategory: { name: string; value: number; color: string }[];
  inventoryTurnover: { category: string; turnover: number; stock: number }[];
  profitMargins: { month: string; margin: number; profit: number }[];
  customerFunnel: { stage: string; count: number; percentage: number }[];
  visibleWidgets: {
    revenueTrends: boolean;
    salesByCategory: boolean;
    inventoryTurnover: boolean;
    profitMargins: boolean;
    customerFunnel: boolean;
  };
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
  revenueTrends: [],
  salesByCategory: [],
  inventoryTurnover: [],
  profitMargins: [],
  customerFunnel: [],
  visibleWidgets: {
    revenueTrends: true,
    salesByCategory: true,
    inventoryTurnover: true,
    profitMargins: true,
    customerFunnel: true,
  },
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
    setRevenueTrends: (
      state,
      action: PayloadAction<{ date: string; revenue: number; profit: number }[]>
    ) => {
      state.revenueTrends = action.payload;
    },
    setSalesByCategory: (
      state,
      action: PayloadAction<{ name: string; value: number; color: string }[]>
    ) => {
      state.salesByCategory = action.payload;
    },
    setInventoryTurnover: (
      state,
      action: PayloadAction<
        { category: string; turnover: number; stock: number }[]
      >
    ) => {
      state.inventoryTurnover = action.payload;
    },
    setProfitMargins: (
      state,
      action: PayloadAction<{ month: string; margin: number; profit: number }[]>
    ) => {
      state.profitMargins = action.payload;
    },
    setCustomerFunnel: (
      state,
      action: PayloadAction<
        { stage: string; count: number; percentage: number }[]
      >
    ) => {
      state.customerFunnel = action.payload;
    },
    toggleWidget: (
      state,
      action: PayloadAction<keyof DashboardState["visibleWidgets"]>
    ) => {
      state.visibleWidgets[action.payload] =
        !state.visibleWidgets[action.payload];
    },
    updateStats: (
      state,
      action: PayloadAction<Partial<DashboardState["stats"]>>
    ) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
});

export const {
  setStats,
  setRecentOrders,
  setTopProducts,
  setSalesChart,
  setRevenueTrends,
  setSalesByCategory,
  setInventoryTurnover,
  setProfitMargins,
  setCustomerFunnel,
  toggleWidget,
  updateStats,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
