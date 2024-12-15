import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const Camera: React.FC = () => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [images, setImages] = useState<string[]>([]);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setImages((prevImages) => [...prevImages, image]);
    }
  }, [webcamRef]);

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isWebcamActive ? (
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setIsWebcamActive(true)}
        >
          Start Camera
        </button>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-md shadow-md"
            width={540}
            height={360}
          />
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={capture}
          >
            Capture Photo
          </button>

          {images.length > 0 && (
            <div className="flex flex-wrap justify-center space-x-4">
              {images.map((src, index) => (
                <div
                  key={index}
                  className="relative group w-32 h-32 flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={`Captured ${index + 1}`}
                    className="w-full h-full object-cover rounded-md border border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Camera;
