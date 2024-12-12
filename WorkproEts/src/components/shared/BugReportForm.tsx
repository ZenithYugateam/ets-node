import React, { useState } from 'react';
import { MultiImageUpload } from './MultiImageUpload';
import { createImagePreview, generateUniqueId } from './ImageHelpers';

interface BugReportFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading : boolean;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export function BugReportForm({ onSubmit, onCancel, isLoading }: BugReportFormProps) {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleImagesChange = async (files: File[]) => {
    const newImages = await Promise.all(
      files.map(async (file) => ({
        id: generateUniqueId(),
        file,
        preview: await createImagePreview(file),
      }))
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageRemove = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return; 
  setIsSubmitting(true);

  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`screenshot_${index}`, image.file);
  });
  formData.append('description', description);
  onSubmit(formData);

  setDescription('');
  setImages([]);
  setIsSubmitting(false);
};

  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Screenshots
        </label>
        <MultiImageUpload
          images={images.map(({ id, preview }) => ({ id, preview }))}
          onImagesChange={handleImagesChange}
          onImageRemove={handleImageRemove}
        />
        {images.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {images.length} screenshot{images.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:ring-red-500"
          placeholder="Please describe the issue you're experiencing..."
          required
        />
      </div>

      <div className="sticky bottom-0 pt-4 bg-white flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}