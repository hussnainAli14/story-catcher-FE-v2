import React from 'react';

interface StoryboardProps {
  content: string;
  images?: string[];
  videoUrl?: string;
}

const Storyboard: React.FC<StoryboardProps> = ({ content, images = [], videoUrl }) => {
  // Parse the storyboard content and format it simply
  const formatStoryboard = (text: string) => {
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
        {videoUrl && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-black mb-3">
              🎬 Your Generated Video
            </h3>
            <div className="space-y-3">
              {videoUrl.startsWith('videogen://') ? (
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
                    Video ID: {videoUrl.replace('videogen://', '')}
                  </p>
                </div>
              ) : (
                <>
                  <video 
                    controls 
                    className="w-full max-w-2xl rounded-lg shadow-sm"
                    poster={images[0]} // Use first image as poster
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="text-sm text-gray-600">
                    <p><strong>Video URL:</strong> <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{videoUrl}</a></p>
                    <p><strong>Generated from:</strong> {images.length} DALL-E 3 images</p>
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
