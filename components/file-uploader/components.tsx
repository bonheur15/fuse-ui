import * as React from "react";
import { cva } from "class-variance-authority";
import {
  UploadCloud,
  File as FileIcon,
  Trash2,
  Edit3,
  X,
  Check,
} from "lucide-react";

import { formatBytes } from "./utils";
import { ManagedFile, FileUploaderProps, FilePreviewActions } from "./types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { Input } from "@/components/ui/input";

export const fileUploaderVariants = cva(
  "relative flex flex-col items-center justify-center w-full gap-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-300 dark:border-gray-700",
        active: "border-primary bg-primary/10",
        disabled:
          "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 cursor-not-allowed opacity-50",
        error: "border-destructive bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const DropzoneContent: React.FC<{ props: FileUploaderProps }> = ({
  props,
}) => {
  const { multiple, accept, maxSize } = props;
  return (
    <>
      <UploadCloud className="w-12 h-12 text-gray-400" />
      <p className="font-semibold text-gray-700 dark:text-gray-300">
        Drag & drop files here, or click to select
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {multiple ? `You can upload multiple files. ` : ""}
        {accept ? `Allowed types: ${accept}. ` : ""}
        {maxSize ? `Max size: ${formatBytes(maxSize)}.` : ""}
      </p>
    </>
  );
};

export const FilePreviewItem: React.FC<{
  file: ManagedFile;
  actions: FilePreviewActions;
  onRename: (newName: string) => void;
}> = ({ file, actions, onRename }) => {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [draftName, setDraftName] = React.useState(file.name);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRename(draftName);
    setIsRenaming(false);
  };

  const isImage = file.file.type.startsWith("image/");

  return (
    <div className="relative w-full p-3 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.previewUrl}
              alt={file.name}
              className="object-cover w-16 h-16 rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md dark:bg-gray-700">
              <FileIcon className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          {isRenaming ? (
            <form
              onSubmit={handleRenameSubmit}
              className="flex items-center gap-2"
            >
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="h-8"
                autoFocus
                onBlur={() => setIsRenaming(false)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <Check className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <p
              className="text-sm font-semibold truncate dark:text-white"
              title={file.name}
            >
              {file.name}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(file.file.size)}
            {file.status === "error" && (
              <span className="ml-2 text-destructive">{file.error}</span>
            )}
            {file.status === "success" && (
              <span className="ml-2 text-green-600">Uploaded</span>
            )}
          </p>
          {file.status === "uploading" && (
            <Progress value={file.progress} className="h-2 mt-1" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {file.status === "pending" && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8"
                onClick={() => setIsRenaming(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-destructive"
                onClick={actions.remove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          {file.status !== "pending" && file.status !== "uploading" && (
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-destructive"
              onClick={actions.remove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
