// Video processing service to extract frames from videos for analysis

/**
 * Extracts frames from a video file at specified intervals
 * @param videoFile The video file to process
 * @param frameCount Number of frames to extract (default: 5)
 * @param interval Interval in seconds between frames (default: 1)
 * @returns Promise resolving to array of base64 encoded frame images
 */
export const extractVideoFrames = async (
  videoFile: File,
  frameCount: number = 5,
  interval: number = 1
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';

    const frames: string[] = [];
    let framesExtracted = 0;
    let currentTime = 0;

    video.onloadedmetadata = () => {
      if (!video.videoWidth || !video.videoHeight) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Invalid video dimensions'));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      if (!duration || isNaN(duration) || duration <= 0) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Invalid video duration'));
        return;
      }

      const actualInterval = Math.max(0.1, Math.min(interval, duration / Math.max(1, frameCount)));

      const extractFrame = () => {
        if (framesExtracted >= frameCount || currentTime >= duration) {
          URL.revokeObjectURL(videoUrl);
          if (frames.length > 0) {
            resolve(frames);
          } else {
            reject(new Error('No frames could be extracted from video'));
          }
          return;
        }

        video.currentTime = Math.min(currentTime, duration - 0.1);
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          frames.push(frameData);
          framesExtracted++;
          currentTime += actualInterval;
          extractFrame();
        } catch (error) {
          console.error('Error extracting frame:', error);
          URL.revokeObjectURL(videoUrl);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Error loading video'));
      };

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (frames.length === 0) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Timeout while extracting video frames'));
        }
      }, 30000); // 30 second timeout

      extractFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Error loading video metadata'));
    };
  });
};

/**
 * Gets a thumbnail/preview frame from a video
 * @param videoFile The video file
 * @param timeOffset Time in seconds to extract frame (default: 0.5)
 * @returns Promise resolving to base64 encoded image
 */
export const getVideoThumbnail = async (
  videoFile: File,
  timeOffset: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = Math.min(timeOffset, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(videoUrl);
        resolve(thumbnail);
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Error loading video'));
    };
  });
};

/**
 * Gets video duration in seconds
 */
export const getVideoDuration = (videoFile: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(videoUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Error loading video metadata'));
    };
  });
};

