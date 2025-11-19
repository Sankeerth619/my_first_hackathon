import React, { useEffect, useRef, useState, useCallback } from 'react';
import { XIcon, ErrorIcon } from './Icons';

interface CameraFeedProps {
  onCapture: (dataUrl: string, blob: Blob) => void;
  onClose: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (isMounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. Please ensure you have a camera connected and have granted permission in your browser.";
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = "Camera access was denied. Please grant permission in your browser settings to use this feature.";
        }
        if (isMounted) {
            setError(errorMessage);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run only once on mount

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(dataUrl, blob);
          }
        }, 'image/jpeg');
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center animate-fade-in">
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-20">
        <XIcon className="w-8 h-8" />
      </button>

      {error ? (
        <div className="text-white text-center p-8 max-w-md bg-gray-800 rounded-lg">
            <ErrorIcon className="w-12 h-12 mx-auto text-red-500 mb-4"/>
            <h3 className="text-xl font-bold mb-2">Camera Error</h3>
            <p className="text-gray-300">{error}</p>
        </div>
      ) : (
        <>
            <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-8 z-20">
                <button 
                    onClick={handleCapture}
                    aria-label="Capture photo"
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-brand-orange-500/50"
                >
                    <div className="w-16 h-16 rounded-full bg-white ring-2 ring-inset ring-gray-400"></div>
                </button>
            </div>
        </>
      )}
    </div>
  );
};
