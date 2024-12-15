import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraProps {
  onImageCapture: (image: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onImageCapture }) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      onImageCapture(image); 
    }
  }, [webcamRef, onImageCapture]);

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
        </>
      )}
    </div>
  );
};

export default Camera;
