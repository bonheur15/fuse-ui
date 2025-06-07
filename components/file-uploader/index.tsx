"use client";
import * as React from "react";
import { useDropzone, DropzoneState } from "react-dropzone";
import { useFileUploader } from "./hooks";
import { cn } from "./utils";
import { FileUploaderProps, UploaderConfig } from "./types";
import {
  fileUploaderVariants,
  DropzoneContent,
  FilePreviewItem,
} from "./components";
import { Button } from "../ui/button";

const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      uploader,
      children,
      className,
      name,
      multiple = false,
      maxFiles = 1,
      maxSize = Infinity,
      accept,
      disabled = false,
      renderFilePreview,
      onFilesAdded,
      ...props
    },
    ref
  ) => {
    const uploaderConfig: UploaderConfig = uploader ?? { type: "local" };

    const {
      files,
      isUploading,
      addFiles,
      removeFile,
      renameFile,
      startAllUploads,
      uploadFile,
    } = useFileUploader({
      ...props,
      uploader: uploaderConfig,
      multiple,
      maxFiles,
      maxSize,
      accept,
      onFilesAdded,
    });

    const onDrop = React.useCallback(
      (acceptedFiles: File[]) => {
        addFiles(acceptedFiles);
      },
      [addFiles]
    );

    const { getRootProps, getInputProps, isDragActive }: DropzoneState =
      useDropzone({
        onDrop,
        multiple,
        maxSize,
        accept: accept ? { [accept]: [] } : undefined,
        disabled: disabled || isUploading,
      });

    // Determine the dropzone variant based on state
    const variant = React.useMemo(() => {
      if (disabled || isUploading) return "disabled";
      if (isDragActive) return "active";
      // Add error variant logic if needed
      return "default";
    }, [isDragActive, disabled, isUploading]);

    return (
      <div className="w-full">
        <div
          ref={ref}
          {...getRootProps()}
          className={cn(fileUploaderVariants({ variant }), className)}
        >
          <input {...getInputProps()} name={`${name}-input`} />
          {children ? (
            children
          ) : (
            <DropzoneContent
              props={{
                ...props,
                uploader: uploaderConfig,
                multiple,
                maxSize,
                accept,
              }}
            />
          )}
        </div>

        <input
          type="hidden"
          name={name}
          value={JSON.stringify(
            files
              .filter((f) => f.status === "success")
              .map((f) => f.uploadedUrl)
          )}
        />

        {files.length > 0 && (
          <div className="flex flex-col w-full gap-2 mt-4">
            {files.map((file) => {
              const actions = {
                remove: () => removeFile(file.id),
                rename: () => {},
                startUpload: () => uploadFile(file),
              };

              if (renderFilePreview) {
                return (
                  <div key={file.id}>{renderFilePreview(file, actions)}</div>
                );
              }

              return (
                <FilePreviewItem
                  key={file.id}
                  file={file}
                  actions={actions}
                  onRename={(newName) => renameFile(file.id, newName)}
                />
              );
            })}
            {files.some((f) => f.status === "pending") && (
              <Button
                onClick={startAllUploads}
                disabled={isUploading}
                className="w-full mt-2"
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${
                      files.filter((f) => f.status === "pending").length
                    } File(s)`}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

FileUploader.displayName = "FileUploader";

export { FileUploader };
