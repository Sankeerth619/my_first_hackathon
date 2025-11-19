import React, { useState, useRef, useEffect } from 'react';
import { analyzeViolationImage, analyzeViolationVideo, findNearbyPoliceStations } from '../services/geminiService';
import { getExifLocation } from '../services/exifService';
import { getCurrentLocation } from '../services/locationService';
import { generateImageHash, isHashStored, storeHash } from '../services/imageHashingService';
import { extractVideoFrames, getVideoThumbnail } from '../services/videoService';
import { saveReport, isMediaHashExists } from '../services/databaseService';
import { ViolationReportData, PoliceStation } from '../types';
import { ViolationReport } from './ViolationReport';
import { PointsAwardedModal } from './PointsAwardedModal';
import { RankUpModal } from './RankUpModal';
import { CameraFeed } from './CameraFeed';
import { Rank } from '../types';
import { UploadIcon, AnalysisIcon, ErrorIcon, FingerprintIcon, CameraIcon, RetakeIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './Auth';

interface HomePageProps {
  onReportGenerated: (report: ViolationReportData) => void;
  onStationsFound: (stations: PoliceStation[]) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const ButtonGroupMorph: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [morphStyle, setMorphStyle] = useState({});

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        const container = containerRef.current;
        if (!target || !container) return;

        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        setMorphStyle({
            opacity: 1,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            transform: `translate(${targetRect.left - containerRect.left}px, ${targetRect.top - containerRect.top}px)`,
        });
    };

    const handleMouseLeave = () => {
        setMorphStyle({ ...morphStyle, opacity: 0 });
    };

    return (
        <div ref={containerRef} onMouseLeave={handleMouseLeave} className="relative flex flex-col sm:flex-row justify-center items-center gap-4">
            <div style={morphStyle} className="morph-bg opacity-0 rounded-lg"></div>
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { onMouseEnter: handleMouseEnter } as React.HTMLAttributes<HTMLElement>)
                    : child
            )}
        </div>
    );
};


export const HomePage: React.FC<HomePageProps> = ({ onReportGenerated, onStationsFound, onShowToast }) => {
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ViolationReportData | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [rankUpInfo, setRankUpInfo] = useState<{ newRank: Rank; pointsAwarded: number } | null>(null);
  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { user, updateUserPoints, incrementViolationCount } = useAuth();

  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [analysisResult]);

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (video) {
        URL.revokeObjectURL(video);
      }
    };
  }, [video]);

  const resetState = () => {
      setImage(null);
      setVideo(null);
      setFile(null);
      setMediaType(null);
      setAnalysisResult(null);
      setError(null);
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      resetState();
      setFile(selectedFile);
      
      // Check if it's a video or image
      if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
        try {
          const thumbnail = await getVideoThumbnail(selectedFile);
          setImage(thumbnail);
          const videoUrl = URL.createObjectURL(selectedFile);
          setVideo(videoUrl);
        } catch (error) {
          setError('Failed to load video. Please try another file.');
          console.error('Error loading video:', error);
        }
      } else if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setError('Please select an image or video file.');
      }
    }
  };

  const handleCapture = (dataUrl: string, blob: Blob) => {
    resetState();
    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setFile(capturedFile);
    setMediaType('image');
    setImage(dataUrl);
    setShowCamera(false);
  };
  
  const handleAnalyzeClick = async () => {
    if (!file || (!image && !video)) {
      setError("Please select or capture an image or video first.");
      return;
    }

    if (!mediaType) {
      setError("Unable to determine media type.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      setProgressText('Verifying media...');
      const mediaHash = await generateImageHash(file);
      
      // Check both localStorage and database for duplicates
      const isStored = isHashStored(mediaHash);
      const isInDb = await isMediaHashExists(mediaHash);
      
      if (isStored || isInDb) {
        throw new Error("This media has already been submitted. Please upload or capture a new and original file.");
      }

      const getLocation = async () => {
          setProgressText('Acquiring location...');
          try {
              const exifLocation = await getExifLocation(file);
              if (exifLocation) return exifLocation;
          } catch (exifError) {
              console.warn("Could not get EXIF location:", (exifError as Error).message);
          }
          try {
              const gpsLocation = await getCurrentLocation();
              return gpsLocation;
          } catch (gpsError) {
              console.warn("Could not get current location:", (gpsError as Error).message);
              return null;
          }
      };
      
      let geminiResult;
      
      if (mediaType === 'video') {
        setProgressText('Extracting video frames...');
        const frames = await extractVideoFrames(file, 5, 1);
        
        if (frames.length === 0) {
          throw new Error("Failed to extract frames from video.");
        }
        
        setProgressText('Analyzing video with AI...');
        geminiResult = await analyzeViolationVideo(frames);
      } else {
        setProgressText('Analyzing image with AI...');
        const base64Image = image!.split(',')[1];
        geminiResult = await analyzeViolationImage(base64Image, file.type);
      }
      
      setProgressText('Compiling report...');
      const mediaUrl = mediaType === 'video' ? (video || image!) : image!;
      
      const newReport: ViolationReportData = {
        ...geminiResult,
        imageUrl: image || mediaUrl, // Use thumbnail for videos
        mediaType,
        videoUrl: mediaType === 'video' ? video : undefined,
        location: await getLocation(),
        reportId: `REP-${Date.now()}`,
        userId: user?.username || null,
        username: user?.username || null,
      };
      
      // Save to database
      setProgressText('Saving to database...');
      await saveReport(
        newReport,
        mediaUrl,
        mediaHash,
        mediaType,
        user?.username || null,
        user?.username || null
      );
      
      // Also store hash in localStorage for quick duplicate checking
      storeHash(mediaHash);
      
      setAnalysisResult(newReport);
      onReportGenerated(newReport);
      
      if (newReport.isViolation && newReport.location) {
          try {
            setProgressText('Notifying authorities...');
            const stations = await findNearbyPoliceStations(newReport.location.latitude, newReport.location.longitude);
            onStationsFound(stations);
            onShowToast('Report logged. Notifying nearby authorities.', 'success');
          } catch (stationError) {
            console.error("Could not find police stations, but report was saved.", stationError);
            onShowToast('Report logged, but could not contact authorities.', 'error');
          }
      }

      if (user && newReport.isViolation) {
        setProgressText('Awarding points...');
        const rewardPoints = 10;
        await updateUserPoints(rewardPoints);
        setRewardAmount(rewardPoints);
        setIsRewardModalOpen(true);
        
        // Increment violation count and check for rank up
        setProgressText('Checking rank...');
        const rankResult = await incrementViolationCount();
        if (rankResult.rankedUp && rankResult.newRank) {
          // Show rank up modal after points modal
          setTimeout(() => {
            setRankUpInfo({ 
              newRank: rankResult.newRank, 
              pointsAwarded: rankResult.pointsAwarded 
            });
          }, 2000); // Wait 2 seconds after points modal shows
        }
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
      setProgressText('');
    }
  };

  const triggerFileSelect = () => {
    if (!isLoading) {
        fileInputRef.current?.click();
    }
  };

  const isDuplicateError = error && error.includes("already been submitted");

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      {isRewardModalOpen && (
        <PointsAwardedModal 
          points={rewardAmount} 
          onClose={() => {
            setIsRewardModalOpen(false);
            // Show rank up modal after points modal closes if user ranked up
            if (rankUpInfo) {
              setTimeout(() => {
                // Small delay to allow points modal to close
              }, 300);
            }
          }} 
        />
      )}
      {rankUpInfo && (
        <RankUpModal 
          newRank={rankUpInfo.newRank} 
          pointsAwarded={rankUpInfo.pointsAwarded} 
          onClose={() => setRankUpInfo(null)} 
        />
      )}
      {showCamera && <CameraFeed onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      
      <div className="bg-slate-800/50 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="p-8 bg-brand-orange-600 text-white text-center">
            <h2 className="text-4xl font-bold">Report a Traffic Violation</h2>
            <p className="mt-2 text-brand-orange-100">Capture or upload an image or video to be analyzed for traffic violations.</p>
            {!user && (
              <div className="mt-6">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-3 text-lg font-bold text-white bg-white/20 hover:bg-white/30 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm border-2 border-white/30"
                >
                  Login / Sign Up to Report Violations
                </button>
              </div>
            )}
        </div>
        
        <div className="p-6 sm:p-8">
          {!user ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-brand-orange-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-200 mb-3">Please Login to Continue</h3>
              <p className="text-slate-400 mb-6 max-w-md">You need to be logged in to report traffic violations and help make our roads safer.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-10 py-4 text-lg font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 rounded-full shadow-lg transition-all duration-200"
              >
                Login / Sign Up
              </button>
            </div>
          ) : (
            <>
              <input type="file" accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              
              <div className="mt-1 flex justify-center p-6 border-2 border-dashed rounded-xl border-slate-600 min-h-[272px]">
                <div className="space-y-2 text-center flex flex-col justify-center items-center">
                  {(image || video) ? (
                <div className="relative">
                    {mediaType === 'video' && video ? (
                      <video src={video} controls className={`mx-auto h-56 w-auto rounded-lg shadow-md transition-opacity duration-300 ${isLoading ? 'opacity-40' : 'opacity-100'}`} />
                    ) : (
                      <img src={image!} alt="Preview" className={`mx-auto h-56 w-auto rounded-lg shadow-md transition-opacity duration-300 ${isLoading ? 'opacity-40' : 'opacity-100'}`} />
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg">
                            <svg className="animate-spin h-10 w-10 text-brand-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-3 text-sm font-semibold text-brand-orange-200">{progressText || 'Analyzing, please wait...'}</p>
                        </div>
                    )}
                </div>
              ) : (
                <ButtonGroupMorph>
                  <button onClick={() => setShowCamera(true)} className="relative z-10 flex flex-col items-center justify-center p-8 rounded-lg bg-brand-orange-500 text-white shadow-lg transition-colors duration-200 hover:bg-brand-orange-600">
                    <CameraIcon className="w-12 h-12 mb-2" />
                    <span className="font-bold">Launch Camera</span>
                  </button>
                  <button onClick={triggerFileSelect} className="relative z-10 flex flex-col items-center justify-center p-8 rounded-lg bg-brand-orange-500 text-white shadow-lg transition-colors duration-200 hover:bg-brand-orange-600">
                    <UploadIcon className="w-12 h-12 mb-2" />
                    <span className="font-bold">Upload from Device</span>
                  </button>
                </ButtonGroupMorph>
                  )}
                </div>
              </div>
              {image && <p className="text-center text-sm text-slate-400 mt-3 font-medium">{file?.name}</p>}
            </>
          )}
        </div>

        {user && image && (
          <div className="px-6 sm:px-8 pb-8 text-center">
             <ButtonGroupMorph>
                <button
                    onClick={resetState}
                    disabled={isLoading}
                    className="relative z-10 inline-flex items-center justify-center px-8 py-3 border border-slate-600 text-lg font-bold rounded-full shadow-sm text-slate-200 bg-slate-700 disabled:opacity-50 transition-colors duration-200"
                >
                    <RetakeIcon className="w-6 h-6 mr-2" />
                    Retake Photo
                </button>
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading}
                  className="relative z-10 inline-flex items-center justify-center px-12 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {progressText || 'Analyzing...'}
                      </>
                  ) : (
                      <>
                          <AnalysisIcon className="w-6 h-6 mr-3" />
                          Analyze {mediaType === 'video' ? 'Video' : 'Image'}
                      </>
                  )}
                </button>
             </ButtonGroupMorph>
          </div>
        )}
        
        {error && (
            <div className={`m-8 p-4 border-l-4 rounded-r-lg flex items-center ${isDuplicateError ? 'border-yellow-400 bg-yellow-900/50' : 'border-red-400 bg-red-900/50'}`}>
                {isDuplicateError ? 
                    <FingerprintIcon className="w-6 h-6 text-yellow-400 mr-3" /> :
                    <ErrorIcon className="w-6 h-6 text-red-400 mr-3" />
                }
                <p className={`text-sm font-medium ${isDuplicateError ? 'text-yellow-200' : 'text-red-200'}`}>{error}</p>
            </div>
        )}

        {analysisResult && (
            <div ref={resultsRef} className="p-4 sm:p-8">
                <h3 className="text-2xl font-semibold text-center text-brand-orange-400 mb-4">Analysis Complete</h3>
                <ViolationReport report={analysisResult} />
            </div>
        )}
      </div>
    </div>
  );
};