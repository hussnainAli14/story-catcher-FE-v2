"use client"
import React, { useState, useEffect } from 'react'
import { Chat, ChatInput, Header, Popup, ErrorBoundary, TipsCarousel } from '../components'
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
        closeEmailPopup,
        emailSubmitted
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

    const getPlaceholderText = () => {
        if (isComplete) return "Your story is complete!";
        if (isLoading) {
            if (currentQuestion === 1) return "Completing question 1 of 4";
            if (currentQuestion === 2) return "Completing question 2 of 4";
            if (currentQuestion === 3) return "Completing question 3 of 4";
            if (currentQuestion === 4) return "Writing the script for your video";
            return "Writing your script (Few seconds)";
        }
        return `Q${currentQuestion} of ${totalQuestions}: Type your answer here...`;
    };

    return (
        <ErrorBoundary>
            {showEmailPopup && <Popup handleClose={handleClosePopup} onGenerateVideo={handleEmailCapture} />}
            <div className="h-screen flex flex-col" style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <Header />
                <div className='flex-1 sm:px-20 px-5 pb-10 overflow-y-auto scrollbar-hide'>
                    <div className="flex flex-col items-center gap-4 py-10">
                        <h1 className='text-3xl font-bold text-center font-tektur text-forest'>
                            Start your story interview
                        </h1>
                        <div className="flex items-center gap-4">
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
                            {/* Tips Carousel only shows during video generation */}
                            {videoGenerating && (
                                <TipsCarousel phase={emailSubmitted ? 'email-submitted' : 'start'} />
                            )}

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