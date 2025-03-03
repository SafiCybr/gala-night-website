import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/file-input';

const UploadReceipt = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File size too large",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Allowed file types are JPEG, PNG, and PDF.",
        variant: "destructive",
      });
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${userId}/${fileName}`;

    setFile(selectedFile);

    try {
      setUploading(true);
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${userId}/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('event-receipts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
          // Removed onUploadProgress as it's not supported in the FileOptions type
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
        .update({ receipt_url: publicUrl })
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
        description: "Receipt uploaded successfully!",
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
    <div>
      <Label htmlFor="receipt" className="mb-2">
        Upload Receipt
      </Label>
      <FileInput onFileChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default UploadReceipt;
