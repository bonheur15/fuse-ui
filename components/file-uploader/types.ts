import { VariantProps } from "class-variance-authority";
import { fileUploaderVariants } from "./components";

export type FileStatus = "pending" | "uploading" | "success" | "error";

export interface ManagedFile {
  id: string;
  file: File;
  name: string;
  status: FileStatus;
  progress: number;
  previewUrl: string;
  error?: string;
  uploadedUrl?: string;
}

export interface CustomUploaderConfig {
  type: "custom";
  endpoint: URL | string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  fieldName?: string;
}

export interface CloudinaryUploaderConfig {
  type: "cloudinary";
  cloudName: string;
  uploadPreset: string;
}

export interface S3UploaderConfig {
  type: "s3";
  getPreSignedUrl: (file: File) => Promise<{
    url: string;
    fields?: Record<string, string>;
    method?: "POST" | "PUT";
  }>;
}

export interface LocalUploaderConfig {
  type: "local";
  simulationDelay?: number;
}

export type UploaderConfig =
  | CustomUploaderConfig
  | CloudinaryUploaderConfig
  | S3UploaderConfig
  | LocalUploaderConfig;

export interface FilePreviewActions {
  remove: () => void;
  rename: () => void;
  startUpload: () => Promise<void>;
}

export interface FileUploaderProps
  extends VariantProps<typeof fileUploaderVariants> {
  uploader: UploaderConfig;
  children?: React.ReactNode;
  className?: string;
  name?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
  renderFilePreview?: (
    file: ManagedFile,
    actions: FilePreviewActions
  ) => React.ReactNode;

  onUploadStart?: (file: ManagedFile) => void;
  onUploadProgress?: (file: ManagedFile, progress: number) => void;
  onUploadSuccess?: (file: ManagedFile, uploadedUrl?: string) => void;
  onUploadError?: (file: ManagedFile, error: string) => void;
  onFilesAdded?: (files: ManagedFile[]) => void;
  onFileRemoved?: (file: ManagedFile) => void;
  onAllUploadsComplete?: (files: ManagedFile[]) => void;
}
