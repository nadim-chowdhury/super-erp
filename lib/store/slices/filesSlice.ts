import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileItem } from "@/lib/data/demoData";

interface FilesState {
  files: FileItem[];
  uploadQueue: {
    id: string;
    file: File;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
  }[];
  filters: {
    category: string;
    search: string;
    dateRange: { start: string; end: string };
  };
  selectedFiles: string[];
  viewMode: "grid" | "list";
}

const initialState: FilesState = {
  files: [],
  uploadQueue: [],
  filters: {
    category: "all",
    search: "",
    dateRange: { start: "", end: "" },
  },
  selectedFiles: [],
  viewMode: "grid",
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.files = action.payload;
    },
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files.unshift(action.payload);
    },
    updateFile: (state, action: PayloadAction<FileItem>) => {
      const index = state.files.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = action.payload;
      }
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f.id !== action.payload);
      state.selectedFiles = state.selectedFiles.filter((id) => id !== action.payload);
    },
    bulkDeleteFiles: (state, action: PayloadAction<string[]>) => {
      state.files = state.files.filter((f) => !action.payload.includes(f.id));
      state.selectedFiles = [];
    },
    addToUploadQueue: (
      state,
      action: PayloadAction<{ id: string; file: File }>
    ) => {
      state.uploadQueue.push({
        id: action.payload.id,
        file: action.payload.file,
        progress: 0,
        status: "pending",
      });
    },
    updateUploadProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const item = state.uploadQueue.find((item) => item.id === action.payload.id);
      if (item) {
        item.progress = action.payload.progress;
        item.status = "uploading";
      }
    },
    completeUpload: (
      state,
      action: PayloadAction<{ id: string; file: FileItem }>
    ) => {
      const index = state.uploadQueue.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.uploadQueue[index].status = "completed";
        state.uploadQueue[index].progress = 100;
        // Add file to files list after a delay (simulate processing)
        setTimeout(() => {
          state.files.unshift(action.payload.file);
          state.uploadQueue = state.uploadQueue.filter(
            (item) => item.id !== action.payload.id
          );
        }, 500);
      }
    },
    failUpload: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const item = state.uploadQueue.find((item) => item.id === action.payload.id);
      if (item) {
        item.status = "error";
        item.error = action.payload.error;
      }
    },
    removeFromUploadQueue: (state, action: PayloadAction<string>) => {
      state.uploadQueue = state.uploadQueue.filter(
        (item) => item.id !== action.payload
      );
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<FilesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: "all",
        search: "",
        dateRange: { start: "", end: "" },
      };
    },
    toggleFileSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedFiles.indexOf(action.payload);
      if (index > -1) {
        state.selectedFiles.splice(index, 1);
      } else {
        state.selectedFiles.push(action.payload);
      }
    },
    selectAllFiles: (state, action: PayloadAction<string[]>) => {
      state.selectedFiles = action.payload;
    },
    clearSelection: (state) => {
      state.selectedFiles = [];
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
  },
});

export const {
  setFiles,
  addFile,
  updateFile,
  deleteFile,
  bulkDeleteFiles,
  addToUploadQueue,
  updateUploadProgress,
  completeUpload,
  failUpload,
  removeFromUploadQueue,
  setFilters,
  clearFilters,
  toggleFileSelection,
  selectAllFiles,
  clearSelection,
  setViewMode,
} = filesSlice.actions;
export default filesSlice.reducer;

