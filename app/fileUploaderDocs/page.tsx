"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Check, Palette, Code, Info, Trash2 } from "lucide-react";

type FileStatus = "pending" | "uploading" | "success" | "error";

interface ManagedFile {
  id: string;
  file: File;
  name: string;
  status: FileStatus;
  progress: number;
  previewUrl: string;
  error?: string;
  uploadedUrl?: string;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/components/file-uploader/utils";
import { FileUploader } from "@/components/file-uploader";
import {
  FilePreviewActions,
  FileUploaderProps,
  UploaderConfig,
} from "@/components/file-uploader/types";

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative p-4 my-4 font-mono text-sm rounded-lg bg-gray-100 dark:bg-gray-900">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <pre className="overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <motion.section
    className="py-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
    <p className="mt-2 text-lg text-muted-foreground">{description}</p>
    <div className="mt-8">{children}</div>
  </motion.section>
);

export default function FileUploaderDocs() {
  const [propsConfig, setPropsConfig] = React.useState<
    Partial<FileUploaderProps>
  >({
    multiple: false,
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024,
    disabled: false,
    accept: "image/*",
  });
  const [uploaderType, setUploaderType] =
    React.useState<UploaderConfig["type"]>("local");
  const [uploaderConfig, setUploaderConfig] = React.useState<UploaderConfig>({
    type: "local",
    simulationDelay: 500,
  });

  const handleUploaderTypeChange = (type: string) => {
    const newType = type as UploaderConfig["type"];
    setUploaderType(newType);
    switch (newType) {
      case "custom":
        setUploaderConfig({
          type: "custom",
          endpoint: "https://api.example.com/upload",
        });
        break;
      case "cloudinary":
        setUploaderConfig({
          type: "cloudinary",
          cloudName: "your-cloud-name",
          uploadPreset: "your-preset",
        });
        break;
      case "s3":
        setUploaderConfig({
          type: "s3",
          getPreSignedUrl: async () => ({
            url: "your-backend-presigned-url-endpoint",
          }),
        });
        break;
      default:
        setUploaderConfig({ type: "local", simulationDelay: 500 });
    }
  };

  const generatedCode = `import { FileUploader } from "@/components/fuseui/file-uploader";\n\nfunction App() {\n  const uploaderConfig = ${JSON.stringify(
    uploaderConfig,
    (key, value) => {
      if (key === "getPreSignedUrl")
        return "async (file) => { /* fetch pre-signed URL */ }";
      return value;
    },
    2
  )};\n  \n  return (\n    <FileUploader \n      uploader={uploaderConfig}\n      ${
    propsConfig.multiple ? "multiple\n      " : ""
  }${propsConfig.maxFiles ? `maxFiles={${propsConfig.maxFiles}}\n      ` : ""}${
    propsConfig.maxSize ? `maxSize={${propsConfig.maxSize}}\n      ` : ""
  }${propsConfig.accept ? `accept="${propsConfig.accept}"\n      ` : ""}${
    propsConfig.disabled ? "disabled\n" : ""
  }    />\n  )\n}`;

  return (
    <div className="w-full max-w-6xl p-4 mx-auto md:p-8">
      <header className="py-8 text-center">
        <motion.h1
          className="text-5xl font-extrabold tracking-tighter"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          File Uploader
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto mt-4 text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A powerful, customizable, and type-safe file uploader for your React
          applications.
        </motion.p>
      </header>

      <Section
        title="Playground"
        description="Configure the component props and see your changes live. Copy the code when you're ready."
      >
        <Card>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-6 border-b md:border-r md:border-b-0">
                <h3 className="text-lg font-semibold">Configuration</h3>
                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="multiple-switch">Multiple Files</Label>
                      <Switch
                        id="multiple-switch"
                        checked={propsConfig.multiple}
                        onCheckedChange={(c) =>
                          setPropsConfig({
                            ...propsConfig,
                            multiple: c,
                            maxFiles: c ? 5 : 1,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-files">Max Files</Label>
                      <Input
                        id="max-files"
                        type="number"
                        value={propsConfig.maxFiles}
                        disabled={!propsConfig.multiple}
                        className="w-24 h-8"
                        onChange={(e) =>
                          setPropsConfig({
                            ...propsConfig,
                            maxFiles: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-size">Max Size (MB)</Label>
                      <Input
                        id="max-size"
                        type="number"
                        value={(propsConfig.maxSize || 0) / 1024 / 1024}
                        className="w-24 h-8"
                        onChange={(e) =>
                          setPropsConfig({
                            ...propsConfig,
                            maxSize: parseInt(e.target.value) * 1024 * 1024,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="disabled-switch">Disabled</Label>
                      <Switch
                        id="disabled-switch"
                        checked={propsConfig.disabled}
                        onCheckedChange={(c) =>
                          setPropsConfig({ ...propsConfig, disabled: c })
                        }
                      />
                    </div>
                  </div>
                  <Tabs
                    value={uploaderType}
                    onValueChange={handleUploaderTypeChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="local">Local</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                      <TabsTrigger value="cloudinary">Cloudinary</TabsTrigger>
                      <TabsTrigger value="s3">S3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="local" className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Simulates an upload locally. No files are sent.
                      </p>
                    </TabsContent>
                    <TabsContent value="custom" className="mt-4">
                      <div>
                        <Label>Endpoint URL</Label>
                        <Input
                          placeholder="https://api.example.com/upload"
                          value={
                            uploaderConfig.type === "custom"
                              ? String(uploaderConfig.endpoint) || ""
                              : ""
                          }
                          onChange={(e) => {
                            if (uploaderConfig.type === "custom") {
                              setUploaderConfig({
                                type: "custom",
                                endpoint: e.target.value,
                                headers: uploaderConfig.headers || {},
                                body: uploaderConfig.body || {},
                                fieldName: uploaderConfig.fieldName || "",
                              });
                            }
                          }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="cloudinary" className="mt-4 space-y-4">
                      <div>
                        <Label>Cloud Name</Label>
                        <Input
                          placeholder="your-cloud-name"
                          value={
                            uploaderConfig.type === "cloudinary"
                              ? uploaderConfig.cloudName || ""
                              : ""
                          }
                          onChange={(e) => {
                            if (uploaderConfig.type === "cloudinary") {
                              setUploaderConfig({
                                type: "cloudinary",
                                cloudName: e.target.value,
                                uploadPreset: uploaderConfig.uploadPreset || "",
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Upload Preset</Label>
                        <Input
                          placeholder="your-unsigned-preset"
                          value={
                            uploaderConfig.type === "cloudinary"
                              ? uploaderConfig.uploadPreset || ""
                              : ""
                          }
                          onChange={(e) => {
                            if (uploaderConfig.type === "cloudinary") {
                              setUploaderConfig({
                                type: "cloudinary",
                                cloudName: uploaderConfig.cloudName || "",
                                uploadPreset: e.target.value,
                              });
                            }
                          }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="s3" className="mt-4">
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertTitle>Backend Required</AlertTitle>
                        <AlertDescription>
                          S3 uploads require a backend endpoint to securely
                          generate pre-signed URLs.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <div className="flex flex-col p-6 bg-gray-50 dark:bg-black/20">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="flex items-center justify-center flex-grow min-h-[300px] mt-4">
                  <FileUploader
                    {...propsConfig}
                    uploader={uploaderConfig}
                    name="docs-demo"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <CodeBlock code={generatedCode} />
      </Section>

      <Section
        title="Advanced Customization"
        description="Take full control over the appearance by providing a custom file preview component."
      >
        <Alert variant="default" className="mb-8">
          <Palette className="w-4 h-4" />
          <AlertTitle>
            Unlocking Full Potential with `renderFilePreview`
          </AlertTitle>
          <AlertDescription>
            The `renderFilePreview` prop accepts a function that receives the
            file object and actions. Return your own JSX to completely change
            how files in the queue are displayed. This example demonstrates a
            compact, horizontal layout.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Custom Preview Example</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              uploader={{ type: "local", simulationDelay: 1000 }}
              multiple
              maxFiles={5}
              renderFilePreview={CustomFilePreview}
              name="custom-demo"
            />
          </CardContent>
        </Card>
        <CodeBlock code={customPreviewCode} />
      </Section>
    </div>
  );
}

const CustomFilePreview = (file: ManagedFile, actions: FilePreviewActions) => {
  const isImage = file.file.type.startsWith("image/");
  return (
    <motion.div
      className="flex items-center justify-between w-full p-2 space-x-4 text-sm border-b dark:border-gray-700"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center flex-1 min-w-0 gap-3">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            <Code className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.file.size)}
          </p>
        </div>
      </div>
      {file.status === "uploading" && (
        <Progress value={file.progress} className="w-24 h-1" />
      )}
      {file.status === "success" && (
        <Check className="w-5 h-5 text-green-500" />
      )}
      {file.status === "error" && <Info className="w-5 h-5 text-destructive" />}
      {file.status === "pending" && (
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 text-destructive"
          onClick={actions.remove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
};

const customPreviewCode = `import { FileUploader, ManagedFile, FilePreviewActions, formatBytes } from "@/components/fuseui/file-uploader";\nimport { Progress } from "@/components/ui/progress";\nimport { Button } from "@/components/ui/button";\nimport { Code, Check, Info, Trash2 } from "lucide-react";\n\nconst CustomFilePreview = (file: ManagedFile, actions: FilePreviewActions) => {\n    const isImage = file.file.type.startsWith("image/");\n    return (\n        <div className="flex items-center justify-between w-full p-2 space-x-4 text-sm border-b">\n            <div className="flex items-center flex-1 min-w-0 gap-3">\n                {isImage ? <img src={file.previewUrl} alt={file.name} className="w-10 h-10 rounded-full object-cover"/> : <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted"><Code className="w-5 h-5"/></div>}\n                <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-xs text-muted-foreground">{formatBytes(file.file.size)}</p></div>\n            </div>\n            {file.status === 'uploading' && <Progress value={file.progress} className="w-24 h-1" />}\n            {file.status === 'success' && <Check className="w-5 h-5 text-green-500"/>}\n            {file.status === 'error' && <Info className="w-5 h-5 text-destructive"/>}\n            {file.status === 'pending' && (<Button size="icon" variant="ghost" className="w-8 h-8 text-destructive" onClick={actions.remove}><Trash2 className="w-4 h-4" /></Button>)}\n        </div>\n    )\n}\n\nfunction MyUploader() {\n    return <FileUploader uploader={{type: 'local'}} multiple renderFilePreview={CustomFilePreview} />\n}`;
