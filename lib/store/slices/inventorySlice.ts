import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/lib/data/demoData";

interface InventoryState {
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string;
    status: string;
    search: string;
  };
}

const initialState: InventoryState = {
  products: [],
  selectedProduct: null,
  filters: {
    category: "all",
    status: "all",
    search: "",
  },
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<InventoryState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    bulkDeleteProducts: (state, action: PayloadAction<string[]>) => {
      state.products = state.products.filter(
        (p) => !action.payload.includes(p.id)
      );
    },
    bulkUpdateProducts: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Product> }>
    ) => {
      state.products = state.products.map((p) =>
        action.payload.ids.includes(p.id)
          ? { ...p, ...action.payload.updates }
          : p
      );
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Product["status"] }>
    ) => {
      state.products = state.products.map((p) =>
        action.payload.ids.includes(p.id)
          ? {
              ...p,
              status: action.payload.status,
            }
          : p
      );
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setFilters,
  bulkDeleteProducts,
  bulkUpdateProducts,
  bulkUpdateStatus,
} = inventorySlice.actions;
export default inventorySlice.reducer;
