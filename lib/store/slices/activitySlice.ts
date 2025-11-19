import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Activity } from "@/lib/data/demoData";

interface ActivityState {
  activities: Activity[];
  filters: {
    module: string;
    type: string;
    user: string;
    dateRange: { start: string; end: string };
  };
}

const initialState: ActivityState = {
  activities: [],
  filters: {
    module: "all",
    type: "all",
    user: "all",
    dateRange: { start: "", end: "" },
  },
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
      // Keep only last 1000 activities
      if (state.activities.length > 1000) {
        state.activities = state.activities.slice(0, 1000);
      }
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ActivityState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        module: "all",
        type: "all",
        user: "all",
        dateRange: { start: "", end: "" },
      };
    },
  },
});

export const { setActivities, addActivity, setFilters, clearFilters } =
  activitySlice.actions;
export default activitySlice.reducer;

