
import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface UploadReceiptProps {
  className?: string;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({ className }) => {
  const { user, uploadReceipt, isLoading } = useAuth();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.payment?.receiptUrl || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(user?.payment?.receiptUrl || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (receiptFile && !isLoading) {
      // In a real app, you would upload the file to a server and get a URL back
      // For this demo, we'll use a fake URL
      await uploadReceipt(previewUrl || "https://example.com/receipt.jpg");
      // Reset the form
      setReceiptFile(null);
    }
  };

  const isReceiptSubmitted = !!user?.payment?.receiptUrl;
  const isPending = user?.payment?.status === "pending";

  return (
    <div className={cn("animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payment Receipt</h3>
        <div className="flex items-center">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-opacity-10 mr-2 uppercase" 
            style={{
              backgroundColor: isPending ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: isPending ? 'rgb(234, 179, 8)' : 'rgb(34, 197, 94)'
            }}
          >
            {user?.payment?.status || "Not Submitted"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={removeFile}
            disabled={!receiptFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {!previewUrl ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary/70 bg-primary/5"
                : "border-border hover:border-muted-foreground/25 hover:bg-muted/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("receipt-upload")?.click()}
          >
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag & drop your receipt here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, PDF (Max size: 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-border">
            {previewUrl.includes("http") ? (
              <img
                src={previewUrl}
                alt="Payment Receipt"
                className="w-full h-[300px] object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-muted">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={!receiptFile || isLoading || isReceiptSubmitted}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : isReceiptSubmitted ? (
              "Receipt Submitted"
            ) : (
              "Submit Receipt"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadReceipt;
