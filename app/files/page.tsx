"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setFiles } from "@/lib/store/slices/filesSlice";
import { generateFiles } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileManager } from "@/components/files/FileManager";
import { FileItem } from "@/lib/data/demoData";
import { FolderOpen } from "lucide-react";

export default function FilesPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.files);

  useEffect(() => {
    const demoFiles = generateFiles(50);
    dispatch(setFiles(demoFiles));
  }, [dispatch]);

  const handleFileSelect = (file: FileItem) => {
    console.log("File selected:", file);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const fileCountByCategory = files.reduce(
    (acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Files</h1>
            <p className="text-muted-foreground">
              Manage and organize your files
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.keys(fileCountByCategory).length} categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalSize / (1024 * 1024)).toFixed(2)} MB
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All files combined
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fileCountByCategory.document || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Document files
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fileCountByCategory.image || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Image files</p>
            </CardContent>
          </Card>
        </div>

        {/* File Manager */}
        <Card>
          <CardHeader>
            <CardTitle>File Manager</CardTitle>
            <CardDescription>
              Upload, organize, and manage your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileManager onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

