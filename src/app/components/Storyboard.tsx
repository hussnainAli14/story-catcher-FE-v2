import React, { useState, useEffect } from 'react';
import { storyAPI } from '@/lib/api';

interface StoryboardProps {
  content: string;
  images?: string[];
  videoUrl?: string;
  videoGenerating?: boolean;
}

const Storyboard: React.FC<StoryboardProps> = ({ content, images = [], videoUrl, videoGenerating = false }) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);

  // Function to download video
  const downloadVideo = async (url: string) => {
    try {
      // Fetch the video file as a blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and download it
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `story-video-${Date.now()}.mp4`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading video:', error);
      // Fallback: try direct download with download attribute
      const link = document.createElement('a');
      link.href = url;
      link.download = `story-video-${Date.now()}.mp4`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Check video status if it's a processing video
  useEffect(() => {
    if (videoUrl && videoUrl.startsWith('videogen://')) {
      const apiFileId = videoUrl.replace('videogen://', '');
      checkVideoStatus(apiFileId);
    }
  }, [videoUrl]);

  const checkVideoStatus = async (apiFileId: string) => {
    
    const checkStatus = async () => {
      try {
        const result = await storyAPI.checkVideoStatus(apiFileId);
        
        if (result.success && result.result) {
          const loadingState = result.result.loadingState;
          
          if (loadingState === 'FULFILLED') {
            const videoUrl = result.result.apiFileSignedUrl;
            if (videoUrl) {
              setCurrentVideoUrl(videoUrl);
              return;
            }
          }
          
          // Still processing, check again in 10 seconds
          setTimeout(checkStatus, 10000);
        } else {
          // Error or still processing, check again in 15 seconds
          setTimeout(checkStatus, 15000);
        }
      } catch (error) {
        console.error('Error checking video status:', error);
        // Check again in 20 seconds on error
        setTimeout(checkStatus, 20000);
      }
    };
    
    // Start checking after 5 seconds
    setTimeout(checkStatus, 5000);
  };
  // Parse the storyboard content and format it simply
  const formatStoryboard = (text: string) => {
    // If no content but we have a video, just show the video
    if (!text && currentVideoUrl) {
      return (
        <div className="storyboard-container">
          {/* Video Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-black mb-3">
              🎬 Your Generated Video
            </h3>
            <div className="space-y-3">
              {currentVideoUrl.startsWith('videogen://') ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">Video is being generated...</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Your video is currently being processed. This usually takes 2-5 minutes. 
                    The video will appear here once it&apos;s ready.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Video ID: {currentVideoUrl.replace('videogen://', '')}
                  </p>
                </div>
              ) : (
                <>
                  <video 
                    controls 
                    className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    poster={images[0]} // Use first image as poster
                  >
                    <source src={currentVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => downloadVideo(currentVideoUrl)}
                      className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-green-700 transition-colors font-space-mono text-sm flex items-center gap-2 mx-auto"
                    >
                      📥 Download Video
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Split by scenes
    const scenes = text.split(/\*\*Scene \d+:/);
    const titleMatch = text.match(/\*\*Storyboard: "([^"]+)" – ([^*]+)\*\*/);
    
    if (!titleMatch) return text;

    const title = titleMatch[1];
    const subtitle = titleMatch[2];

    return (
      <div className="storyboard-container">
        {/* Simple Title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black">
            🎬 <strong>Storyboard: &ldquo;{title}&rdquo; - {subtitle}</strong>
          </h2>
        </div>

        {/* Editing Instructions */}
        <div className={`mb-4 p-3 border rounded-lg ${
          videoGenerating 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={videoGenerating ? 'text-orange-600' : 'text-blue-600'}>
              {videoGenerating ? '⏳' : '✏️'}
            </span>
            <h3 className={`text-sm font-semibold ${
              videoGenerating ? 'text-orange-800' : 'text-blue-800'
            }`}>
              {videoGenerating ? 'Video Generation in Progress' : 'You can edit your storyboard!'}
            </h3>
          </div>
          <p className={`text-xs ${
            videoGenerating ? 'text-orange-700' : 'text-blue-700'
          }`}>
            {videoGenerating 
              ? 'Editing is disabled while your video is being generated. You can edit after the video is complete or start a new story.'
              : 'Click the edit button (✏️) that appears when you hover over the storyboard to make changes before generating your video.'
            }
          </p>
        </div>

        {/* Simple Scenes */}
        <div className="space-y-4">
          {scenes.slice(1).map((scene, index) => {
            const sceneNumber = index + 1;
            const sceneMatch = scene.match(/^: "([^"]+)"\*\*/);
            const sceneName = sceneMatch ? sceneMatch[1] : `Scene ${sceneNumber}`;
            
            // Extract elements
            const visualMatch = scene.match(/\• \*\*Visual\*\*: ([^\n]+)/);
            const settingMatch = scene.match(/\• \*\*Setting\*\*: ([^\n]+)/);
            const actionMatch = scene.match(/\• \*\*Action\*\*: ([^\n]+)/);
            const moodMatch = scene.match(/\• \*\*Mood\*\*: ([^\n]+)/);
            const soundMatch = scene.match(/\• \*\*Sound\*\*: ([^\n]+)/);
            const transitionMatch = scene.match(/\• \*\*Transition\*\*: ([^\n]+)/);

            return (
              <div key={index} className="scene-container">
                <h3 className="text-base font-bold text-black mb-2">
                  <strong>Scene {sceneNumber}: &ldquo;{sceneName}&rdquo;</strong>
                </h3>
                
                {/* Display image if available */}
                {images[index] && (
                  <div className="mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={images[index]} 
                      alt={`Scene ${sceneNumber}: ${sceneName}`}
                      className="w-full max-w-md rounded-lg shadow-sm border"
                    />
                  </div>
                )}
                
                <div className="space-y-1 ml-4">
                  {visualMatch && (
                    <div className="element-item">
                      <span className="font-bold">• <strong>Visual</strong>:</span>
                      <span className="ml-1">{visualMatch[1]}</span>
                    </div>
                  )}
                  
                  {(settingMatch || actionMatch) && (
                    <div className="element-item">
                      <span className="font-bold">
                        • <strong>{settingMatch ? 'Setting' : 'Action'}</strong>:
                      </span>
                      <span className="ml-1">
                        {settingMatch ? settingMatch[1] : actionMatch?.[1]}
                      </span>
                    </div>
                  )}
                  
                  {moodMatch && (
                    <div className="element-item">
                      <span className="font-bold">• <strong>Mood</strong>:</span>
                      <span className="ml-1">{moodMatch[1]}</span>
                    </div>
                  )}
                  
                  {soundMatch && (
                    <div className="element-item">
                      <span className="font-bold">• <strong>Sound</strong>:</span>
                      <span className="ml-1">{soundMatch[1]}</span>
                    </div>
                  )}
                  
                  {transitionMatch && (
                    <div className="element-item">
                      <span className="font-bold">• <strong>Transition</strong>:</span>
                      <span className="ml-1">{transitionMatch[1]}</span>
                    </div>
                  )}
                </div>
                
                {/* Simple horizontal line between scenes */}
                {index < scenes.length - 2 && (
                  <hr className="my-4 border-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Video Section */}
        {currentVideoUrl && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-black mb-3">
              🎬 Your Generated Video
            </h3>
            <div className="space-y-3">
              {currentVideoUrl.startsWith('videogen://') ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">Video is being generated...</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Your video is currently being processed. This usually takes 2-5 minutes. 
                    The video will appear here once it&apos;s ready.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Video ID: {currentVideoUrl.replace('videogen://', '')}
                  </p>
                </div>
              ) : (
                <>
                  <video 
                    controls 
                    className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    poster={images[0]} // Use first image as poster
                  >
                    <source src={currentVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => downloadVideo(currentVideoUrl)}
                      className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-green-700 transition-colors font-space-mono text-sm flex items-center gap-2 mx-auto"
                    >
                      📥 Download Video
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return formatStoryboard(content);
};

export default Storyboard;
