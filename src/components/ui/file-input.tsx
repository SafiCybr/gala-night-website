
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileInputProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({
  onFileChange,
  accept = "image/jpeg,image/png,application/pdf",
  multiple = false
}) => {
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
    }
    onFileChange(event);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          onClick={handleButtonClick}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Upload size={16} />
          Choose File
        </Button>
        {fileName && (
          <span className="text-sm text-gray-600 truncate max-w-[250px]">
            {fileName}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
      />
    </div>
  );
};
