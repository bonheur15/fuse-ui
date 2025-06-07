import * as React from "react";
import {
  ManagedFile,
  FileUploaderProps,
  S3UploaderConfig,
  CloudinaryUploaderConfig,
  CustomUploaderConfig,
  LocalUploaderConfig,
} from "./types";

export function useFileUploader(props: FileUploaderProps) {
  const {
    uploader,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onFilesAdded,
    onFileRemoved,
    onAllUploadsComplete,
    maxSize = Infinity,
    maxFiles = 1,
  } = props;

  const [files, setFiles] = React.useState<ManagedFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const addFiles = React.useCallback(
    (newFiles: File[]) => {
      const addedManagedFiles: ManagedFile[] = [];

      for (const file of newFiles) {
        if (files.length >= maxFiles) {
          onUploadError?.(
            createManagedFile(file),
            `Cannot add more than ${maxFiles} files.`
          );
          continue;
        }
        if (file.size > maxSize) {
          onUploadError?.(
            createManagedFile(file),
            `File size exceeds the limit of ${maxSize} bytes.`
          );
          continue;
        }
        const managedFile = createManagedFile(file);
        addedManagedFiles.push(managedFile);
      }

      setFiles((prev) => [...prev, ...addedManagedFiles]);
      onFilesAdded?.(addedManagedFiles);
    },
    [files.length, maxFiles, maxSize, onFilesAdded, onUploadError]
  );

  const removeFile = React.useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
        setFiles((prev) => prev.filter((f) => f.id !== id));
        onFileRemoved?.(fileToRemove);
      }
    },
    [files, onFileRemoved]
  );

  const renameFile = React.useCallback((id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  }, []);

  const setProgress = React.useCallback(
    (id: string, progress: number) => {
      setFiles((prev) => {
        const targetFile = prev.find((f) => f.id === id);
        if (targetFile) {
          onUploadProgress?.(targetFile, progress);
        }
        return prev.map((f) => (f.id === id ? { ...f, progress } : f));
      });
    },
    [onUploadProgress]
  );

  const setStatus = React.useCallback(
    (
      id: string,
      status: ManagedFile["status"],
      error?: string,
      uploadedUrl?: string
    ) => {
      setFiles((prev) => {
        const targetFile = prev.find((f) => f.id === id);
        if (targetFile) {
          const updatedFile = { ...targetFile, status, error, uploadedUrl };
          if (status === "success") onUploadSuccess?.(updatedFile, uploadedUrl);
          if (status === "error")
            onUploadError?.(updatedFile, error ?? "Unknown error");
        }
        return prev.map((f) =>
          f.id === id ? { ...f, status, error, uploadedUrl } : f
        );
      });
    },
    [onUploadSuccess, onUploadError]
  );

  const uploadFile = React.useCallback(
    async (file: ManagedFile) => {
      onUploadStart?.(file);
      setStatus(file.id, "uploading");

      try {
        let uploadedUrl: string | undefined;
        switch (uploader.type) {
          case "local":
            uploadedUrl = await handleLocalUpload(file, uploader, (p) =>
              setProgress(file.id, p)
            );
            break;
          case "custom":
            uploadedUrl = await handleCustomUpload(file, uploader, (p) =>
              setProgress(file.id, p)
            );
            break;
          case "cloudinary":
            uploadedUrl = await handleCloudinaryUpload(file, uploader, (p) =>
              setProgress(file.id, p)
            );
            break;
          case "s3":
            uploadedUrl = await handleS3Upload(file, uploader, (p) =>
              setProgress(file.id, p)
            );
            break;
          default:
            throw new Error("Invalid uploader type specified.");
        }
        setStatus(file.id, "success", undefined, uploadedUrl);
      } catch (e) {
        const error = e instanceof Error ? e.message : "Upload failed.";
        setStatus(file.id, "error", error);
      }
    },
    [uploader, onUploadStart, setProgress, setStatus]
  );

  const startAllUploads = React.useCallback(async () => {
    if (isUploading || files.every((f) => f.status === "success")) return;

    setIsUploading(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    await Promise.all(pendingFiles.map(uploadFile));

    setIsUploading(false);
    onAllUploadsComplete?.(files);
  }, [files, isUploading, uploadFile, onAllUploadsComplete]);

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    renameFile,
    startAllUploads,
    uploadFile,
  };
}

function createManagedFile(file: File): ManagedFile {
  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    status: "pending",
    progress: 0,
    previewUrl: URL.createObjectURL(file),
  };
}

function handleLocalUpload(
  file: ManagedFile,
  config: LocalUploaderConfig,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve) => {
    const delay = config.simulationDelay ?? 500 + Math.random() * 500;
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 20, 100);
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve(file.name);
      }
    }, delay / 5);
  });
}

async function handleCustomUpload(
  file: ManagedFile,
  config: CustomUploaderConfig,
  onProgress: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append(config.fieldName || "file", file.file, file.name);

  // Append additional body fields if they exist
  if (config.body) {
    for (const key in config.body) {
      formData.append(key, String(config.body[key]));
    }
  }

  const res = await new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", config.endpoint);

    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });

  if (
    typeof res === "object" &&
    res !== null &&
    "url" in res &&
    typeof (res as { url?: unknown }).url === "string"
  ) {
    return (res as { url: string }).url;
  }
  if (typeof res === "string") {
    return res;
  }
  throw new Error("Invalid response from custom server.");
}

async function handleCloudinaryUpload(
  file: ManagedFile,
  config: CloudinaryUploaderConfig,
  onProgress: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file.file);
  formData.append("upload_preset", config.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`;

  const response = await new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const errorResponse = JSON.parse(xhr.responseText);
        reject(
          new Error(
            errorResponse.error.message ||
              `Upload failed with status: ${xhr.status}`
          )
        );
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });

  const cloudinaryResponse = response as { secure_url?: string };
  if (!cloudinaryResponse.secure_url) {
    throw new Error(
      "Cloudinary upload failed: secure_url not found in response."
    );
  }
  return cloudinaryResponse.secure_url;
}

async function handleS3Upload(
  file: ManagedFile,
  config: S3UploaderConfig,
  onProgress: (progress: number) => void
): Promise<string> {
  const {
    url,
    fields,
    method = "POST",
  } = await config.getPreSignedUrl(file.file);

  const uploadPromise = new Promise<{ status: number; response: string }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          onProgress(percentage);
        }
      };

      xhr.onload = () => {
        resolve({ status: xhr.status, response: xhr.responseText });
      };

      xhr.onerror = () => reject(new Error("Network error during upload."));

      if (method === "POST" && fields) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file.file);
        xhr.send(formData);
      } else {
        xhr.setRequestHeader("Content-Type", file.file.type);
        xhr.send(file.file);
      }
    }
  );

  const { status } = await uploadPromise;

  if (status >= 200 && status < 300) {
    return url.split("?")[0];
  } else {
    throw new Error(`S3 upload failed with status: ${status}`);
  }
}
