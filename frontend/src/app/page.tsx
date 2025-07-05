"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const CONVERSION_TYPES = [
  {
    value: "pdf-to-word",
    label: "PDF to Word",
    accept: ".pdf",
    icon: FileText,
  },
  {
    value: "word-to-pdf",
    label: "Word to PDF",
    accept: ".docx",
    icon: FileText,
  },
  {
    value: "excel-to-pdf",
    label: "Excel to PDF",
    accept: ".xlsx,.xls",
    icon: FileSpreadsheet,
  },
  {
    value: "image-to-pdf",
    label: "Image to PDF",
    accept: ".jpg,.jpeg,.png,.bmp,.gif",
    icon: ImageIcon,
  },
  {
    value: "pdf-to-image",
    label: "PDF to Images",
    accept: ".pdf",
    icon: ImageIcon,
  },
];

const API_BASE_URL = "http://localhost:5000";

export default function DocumentConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionType, setConversionType] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConvertedImages([]);

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: "Please select a file smaller than 50MB.",
        });
        setSelectedFile(null);
        return;
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !conversionType) {
      toast.error("Missing Information", {
        description: "Please select a file and conversion type.",
      });
      return;
    }

    if (backendStatus !== "online") {
      toast.error("Backend Offline", {
        description:
          "Please make sure your Flask backend is running on port 5000.",
      });
      return;
    }

    setIsConverting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${API_BASE_URL}/convert/${conversionType}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      if (conversionType === "pdf-to-image") {
        // Download the returned ZIP file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `converted_${selectedFile.name.split(".")[0]}_images.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Conversion Successful", {
          description: "PDF converted to images and downloaded as ZIP.",
        });
        setConvertedImages([]); // Clear any previous images
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Determine file extension based on conversion type
        let extension = ".pdf";
        if (conversionType === "pdf-to-word") extension = ".docx";

        a.download = `converted_${selectedFile.name.split(".")[0]}${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Conversion Successful", {
          description: "File has been converted and downloaded.",
        });
      }
    } catch (error) {
      toast.error("Conversion Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during conversion.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = async (imagePath: string, index: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/download/${encodeURIComponent(imagePath)}`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `page_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download Successful", {
        description: `Page ${index + 1} downloaded successfully.`,
      });
    } catch {
      toast.error("Download Failed", {
        description: "Failed to download image.",
      });
    }
  };

  const selectedConversion = CONVERSION_TYPES.find(
    (type) => type.value === conversionType
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Document Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert your documents between different formats easily
          </p>
        </div>

        {/* Backend Status Alert */}
        <Alert
          className={`mb-6 ${
            backendStatus === "online"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {backendStatus === "online" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              backendStatus === "online" ? "text-green-800" : "text-red-800"
            }
          >
            {backendStatus === "checking" && "Checking backend connection..."}
            {backendStatus === "online" &&
              "Backend is running and ready for conversions!"}
            {backendStatus === "offline" &&
              "Backend is offline. Please start your Flask server on port 5000."}
          </AlertDescription>
        </Alert>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload & Convert
            </CardTitle>
            <CardDescription>
              Select your file and choose the conversion type to get started.
              Maximum file size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="conversion-type">Conversion Type</Label>
              <Select value={conversionType} onValueChange={setConversionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select conversion type" />
                </SelectTrigger>
                <SelectContent>
                  {CONVERSION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept={selectedConversion?.accept || "*"}
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button
              onClick={handleConvert}
              disabled={
                !selectedFile ||
                !conversionType ||
                isConverting ||
                backendStatus !== "online"
              }
              className="w-full"
              size="lg"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Convert File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {convertedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Converted Images
              </CardTitle>
              <CardDescription>
                Your PDF has been converted to {convertedImages.length} images.
                Click to download each image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {convertedImages.map((imagePath, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 text-center"
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium mb-2">Page {index + 1}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(imagePath, index)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONVERSION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">{type.label}</h3>
                  <p className="text-sm text-gray-600">
                    Convert {type.label.toLowerCase()} files quickly and easily
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
