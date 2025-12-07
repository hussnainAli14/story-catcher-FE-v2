"use client"
import React, { useState, useEffect } from 'react'
import { Chat, ChatInput, Header, Popup, ErrorBoundary } from '../components'
import { useStoryChat } from '@/lib/hooks/useStoryChat'

const Intake = () => {
    const [userInput, setUserInput] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    const {
        messages,
        currentQuestion,
        totalQuestions,
        sessionId,
        isComplete,
        isLoading,
        error,
        showGenerateButton,
        videoGenerated,
        videoGenerating,
        showEmailPopup,
        startSession,
        submitAnswer,
        storeEmail,
        generateVideo,
        editMessage,
        startEditing,
        cancelEditing,
        resetSession,
        clearError,
        checkBackendHealth,
        closeEmailPopup
    } = useStoryChat();

    // Check backend health on component mount
    useEffect(() => {
        const checkHealth = async () => {
            const isHealthy = await checkBackendHealth();
            if (!isHealthy) {
                console.warn('Backend server is not available');
            }
        };
        checkHealth();
    }, [checkBackendHealth]);

    // Auto-start session if user hasn't started yet
    useEffect(() => {
        if (!hasStarted && !sessionId && messages.length === 0) {
            setHasStarted(true);
            startSession();
        }
    }, [hasStarted, sessionId, messages.length, startSession]);

    // No longer show popup early - email capture moved to Generate Video button

    const handleGenerateVideo = () => {
        // Generate video immediately - popup will show after delay if needed
        generateVideo();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        const inputText = userInput.trim();
        setUserInput('');

        try {
            await submitAnswer(inputText);
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    const handleReset = () => {
        resetSession();
        setHasStarted(false);
        setUserInput('');
    };

    const handleClosePopup = () => {
        closeEmailPopup();
    };

    const handleEmailCapture = async (email?: string) => {
        // Store email - it will be used when video finishes generating
        storeEmail(email);
        closeEmailPopup();
    };

    const getProgressText = () => {
        if (isComplete) return "Story Complete!";
        if (currentQuestion > 0) return `Question ${currentQuestion} of ${totalQuestions}`;
        return "Starting your story...";
    };

    const getPlaceholderText = () => {
        if (isComplete) return "Your story is complete!";
        if (isLoading) return "Generating your story...";
        return "Type your answer here...";
    };

    return (
        <ErrorBoundary>
            {showEmailPopup && <Popup handleClose={handleClosePopup} onGenerateVideo={handleEmailCapture} />}
            <div className="h-screen flex flex-col" style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <Header />
                <div className='flex-1 sm:px-20 px-5 pb-10 overflow-y-auto scrollbar-hide'>
                    <div className="flex flex-col items-center gap-4 py-10">
                        <h1 className='text-3xl font-bold text-center font-tektur text-forest'>
                            Answer a Few Questions to Generate Your Video
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-space-mono text-forest bg-white/80 px-3 py-1 rounded-full">
                                {getProgressText()}
                            </span>
                            {error && (
                                <button
                                    onClick={clearError}
                                    className="text-sm font-space-mono text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Error
                                </button>
                            )}
                        </div>
                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm max-w-md text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    <Chat
                        messages={messages}
                        onEditMessage={editMessage}
                        onStartEditing={startEditing}
                        onCancelEditing={cancelEditing}
                        videoGenerated={videoGenerated}
                        videoGenerating={videoGenerating}
                    />

                    {/* Input box positioned right under the chat */}
                    <div className='mt-6'>
                        <ChatInput
                            placeholder={getPlaceholderText()}
                            value={userInput}
                            onChange={handleInputChange}
                            onClick={handleSubmit}
                            disabled={isLoading || isComplete}
                        />
                    </div>

                    {isComplete && (
                        <div className="mt-6 text-center space-y-4">
                            {/* Editing reminder */}
                            <div className={`p-3 border rounded-lg ${videoGenerating
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                <p className={`text-sm ${videoGenerating ? 'text-orange-800' : 'text-yellow-800'
                                    }`}>
                                    {videoGenerating ? (
                                        <>⏳ <strong>Video Generating:</strong> Editing is disabled while your video is being created. You can edit after completion or start a new story.</>
                                    ) : (
                                        <>💡 <strong>Tip:</strong> You can edit your storyboard above before generating your video. Look for the &quot;✏️ Edit&quot; button when you hover over the storyboard.</>
                                    )}
                                </p>
                            </div>

                            {showGenerateButton && !videoGenerating && (
                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={videoGenerating}
                                    className="px-6 py-2 bg-forest text-white rounded-lg hover:bg-green-700 transition-colors font-space-mono disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generate Video
                                </button>
                            )}
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-space-mono"
                            >
                                Start New Story
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default Intake