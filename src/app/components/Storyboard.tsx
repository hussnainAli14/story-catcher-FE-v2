import React from 'react';

interface StoryboardProps {
  content: string;
}

const Storyboard: React.FC<StoryboardProps> = ({ content }) => {
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
            🎬 <strong>Storyboard: "{title}" - {subtitle}</strong>
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
                  <strong>Scene {sceneNumber}: "{sceneName}"</strong>
                </h3>
                
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
      </div>
    );
  };

  return formatStoryboard(content);
};

export default Storyboard;
