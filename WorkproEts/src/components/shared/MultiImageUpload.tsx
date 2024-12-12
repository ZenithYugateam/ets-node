import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { ImageGallery } from './ImageGallery';

interface MultiImageUploadProps {
  images: { id: string; preview: string }[];
  onImagesChange: (files: File[]) => void;
  onImageRemove: (id: string) => void;
  className?: string;
}

export function MultiImageUpload({
  images,
  onImagesChange,
  onImageRemove,
  className = '',
}: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesChange(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onImagesChange(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        className={`${className} cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click or drag images to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            You can upload multiple screenshots
          </p>
        </div>
      </div>
      <ImageGallery images={images} onRemove={onImageRemove} />
    </div>
  );
}