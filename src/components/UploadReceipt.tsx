
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/file-input';
import { AlertCircle, Upload } from 'lucide-react';

const UploadReceipt = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFileError(null);

    if (!selectedFile) {
      setFileError("No file selected");
      return;
    }

    // Limit file size to 100KB (100 * 1024 bytes)
    const maxSize = 100 * 1024;
    if (selectedFile.size > maxSize) {
      setFileError(`File size must be less than 100KB. Your file is ${(selectedFile.size / 1024).toFixed(1)}KB.`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError("Only JPEG, PNG, and PDF files are allowed");
      return;
    }

    setFile(selectedFile);

    try {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${userId}/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('event-receipts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        toast({
          title: "Upload Failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-receipts')
        .getPublicUrl(filePath);

      // Update user's payment record with receipt URL
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          receipt_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        toast({
          title: "Update Failed",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Upload Successful",
        description: "Your receipt has been uploaded successfully and will be reviewed shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Upload Payment Receipt</h3>
      
      <div className="space-y-4">
        <Label htmlFor="receipt" className="block mb-1">
          Upload Receipt (Max: 100KB)
        </Label>
        
        <div className="space-y-3">
          <FileInput onFileChange={handleUpload} />
          
          {fileError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle size={16} />
              <span>{fileError}</span>
            </div>
          )}
          
          {file && !fileError && !uploading && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)}KB)
            </p>
          )}
          
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1 mt-2">
          <p>• File must be less than 100KB</p>
          <p>• Accepted formats: JPEG, PNG, PDF</p>
          <p>• Your receipt will be reviewed by our team</p>
        </div>
      </div>
    </div>
  );
};

export default UploadReceipt;
