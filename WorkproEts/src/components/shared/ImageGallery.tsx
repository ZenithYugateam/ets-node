import { X } from 'lucide-react';

interface ImageGalleryProps {
  images: { id: string; preview: string }[];
  onRemove: (id: string) => void;
}

export function ImageGallery({ images, onRemove }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <img
            src={image.preview}
            alt="Screenshot preview"
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onRemove(image.id)}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}