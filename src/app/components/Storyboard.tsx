import React, { useState, useEffect } from 'react';
import { storyAPI } from '@/lib/api';

interface StoryboardProps {
  content: string;
  images?: string[];
  videoUrl?: string;
  videoHistory?: string[]; // All videos for this storyboard
  videoGenerating?: boolean;
}

const Storyboard: React.FC<StoryboardProps> = ({
  content,
  images = [],
  videoUrl,
  videoHistory = [],
  videoGenerating = false
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [showDownloadInstructions, setShowDownloadInstructions] = useState(false);

  // Update current video URL when prop changes
  useEffect(() => {
    setCurrentVideoUrl(videoUrl);
  }, [videoUrl]);

  // Function to download video
  const downloadVideo = async (url: string) => {
    try {
      // Fetch the video as a blob and create a download link
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `story-video-${Date.now()}.mp4`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Error downloading video:', error);
      // Fallback: show user instructions
      setShowDownloadInstructions(true);
      setTimeout(() => setShowDownloadInstructions(false), 5000); // Hide after 5 seconds
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
                    {showDownloadInstructions && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        💡 If download doesn&apos;t start automatically, right-click on the video above and select &quot;Save video as...&quot;
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Parse the new storyboard format
    const lines = text.split('\n');
    let title = 'Your Story Outline';
    let subtitle = '';
    const sceneContent: { number: number; text: string }[] = [];

    let currentScene = 0;
    let currentText: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Extract title
      if (trimmedLine.startsWith('**Storyboard:')) {
        title = trimmedLine.replace(/\*\*Storyboard:\s*/, '').replace(/\*\*/g, '');
      }
      // Extract subtitle/description
      else if (trimmedLine.startsWith('*This is')) {
        subtitle = trimmedLine.replace(/\*/g, '');
      }
      // Scene header
      else if (trimmedLine.match(/\*\*Scene\s+\d+:\*\*/)) {
        // Save previous scene if exists
        if (currentScene > 0 && currentText.length > 0) {
          sceneContent.push({ number: currentScene, text: currentText.join(' ').trim() });
          currentText = [];
        }
        // Start new scene
        const sceneMatch = trimmedLine.match(/\*\*Scene\s+(\d+):\*\*/);
        if (sceneMatch) {
          currentScene = parseInt(sceneMatch[1]);
        }
      }
      // Scene content (not empty, not tip line)
      else if (trimmedLine && !trimmedLine.startsWith('💡') && currentScene > 0) {
        currentText.push(trimmedLine);
      }
    }

    // Add last scene
    if (currentScene > 0 && currentText.length > 0) {
      sceneContent.push({ number: currentScene, text: currentText.join(' ').trim() });
    }

    // If no scenes found, return simple text rendering
    if (sceneContent.length === 0) {
      return <div className="storyboard-container whitespace-pre-wrap">{text}</div>;
    }

    return (
      <div className="storyboard-container">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">
            🎬 {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 italic">{subtitle}</p>
          )}
        </div>

        {/* Editing Instructions */}
        <div className={`mb-4 p-3 border rounded-lg ${videoGenerating
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
          }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={videoGenerating ? 'text-orange-600' : 'text-blue-600'}>
              {videoGenerating ? '⏳' : '✏️'}
            </span>
            <h3 className={`text-sm font-semibold ${videoGenerating ? 'text-orange-800' : 'text-blue-800'
              }`}>
              {videoGenerating ? 'Video Generation in Progress' : 'You can edit your storyboard!'}
            </h3>
          </div>
          <p className={`text-xs ${videoGenerating ? 'text-orange-700' : 'text-blue-700'
            }`}>
            {videoGenerating
              ? 'Editing is disabled while your video is being generated. You can edit after the video is complete or start a new story.'
              : 'Click the edit button (✏️) that appears when you hover over the storyboard to make changes and generate new videos.'
            }
          </p>
        </div>

        {/* Scene content - Clean layout */}
        <div className="space-y-4">
          {sceneContent.map((scene) => (
            <div key={scene.number} className="scene-item p-4 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest text-white text-base font-bold">
                    {scene.number}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-800 mb-2">Scene {scene.number}</h4>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {scene.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Video Section - Always appears right after storyboard */}
        {currentVideoUrl && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-black">
                🎬 Latest Video
              </h3>
              {videoHistory.length > 1 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {videoHistory.length} videos generated
                </span>
              )}
            </div>
            <div className="space-y-3">
              {currentVideoUrl.startsWith('videogen://') ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">Video is being generated...</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Your latest video is currently being processed. This usually takes 2-5 minutes.
                  </p>
                </div>
              ) : (
                <>
                  <video
                    key={currentVideoUrl}
                    controls
                    className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    poster={images[0]}
                  >
                    <source src={currentVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => downloadVideo(currentVideoUrl)}
                      className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-green-700 transition-colors font-space-mono text-sm flex items-center gap-2 mx-auto"
                    >
                      📥 Download Latest Video
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Previous Videos Section - Only show if there are older videos */}
        {videoHistory && videoHistory.length > 1 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              📼 Previous Videos ({videoHistory.length - 1})
            </h4>
            <div className="space-y-2">
              {videoHistory.slice(1).map((historyVideoUrl, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                  <span className="text-gray-600">
                    Video #{videoHistory.length - index - 1}
                  </span>
                  {!historyVideoUrl.startsWith('videogen://') && (
                    <button
                      onClick={() => downloadVideo(historyVideoUrl)}
                      className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      📥 Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return formatStoryboard(content);
};

export default Storyboard;
