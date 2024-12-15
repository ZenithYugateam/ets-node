import { ChangeEvent, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
}

export const ImageUpload = ({ images, onChange, multiple = true }: ImageUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      onChange(multiple ? [...images, ...files] : [files[0]]);
    },
    [images, multiple, onChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onChange(multiple ? [...images, ...files] : [files[0]]);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop images here, or{' '}
          <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={multiple}
              onChange={handleChange}
            />
          </label>
        </p>
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="h-24 w-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};