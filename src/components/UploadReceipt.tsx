
import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface UploadReceiptProps {
  className?: string;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({ className }) => {
  const { user, uploadReceipt, isLoading } = useAuth();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.payment?.receipt_url || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    if (previewUrl && !previewUrl.includes("supabase.in")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(user?.payment?.receipt_url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !user || isLoading) return;

    try {
      setIsUploading(true);
      
      // Generate a unique filename
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-receipts')
        .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percentage);
          },
        });
        
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('event-receipts')
        .getPublicUrl(filePath);
        
      // Update payment with receipt URL
      await uploadReceipt(publicUrlData.publicUrl);
      
      // Reset file input
      setReceiptFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const isReceiptSubmitted = !!user?.payment?.receipt_url;
  const isPending = user?.payment?.status === 'pending';

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
            <img
              src={previewUrl}
              alt="Payment Receipt"
              className="w-full h-[300px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-center mt-1">
                  Uploading: {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={!receiptFile || isLoading || isUploading || isReceiptSubmitted}
          >
            {isLoading || isUploading ? (
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
                {isUploading ? `Uploading ${uploadProgress}%` : "Processing..."}
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
