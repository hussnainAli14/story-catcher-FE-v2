"use client"
import React, { useState, useEffect } from 'react'
import { Chat, ChatInput, Header, Popup, ErrorBoundary } from '../components'
import { useStoryChat } from '@/lib/hooks/useStoryChat'

const Intake = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
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
        startSession,
        submitAnswer,
        resetSession,
        clearError,
        checkBackendHealth
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
            startSession("I'm ready");
        }
    }, [hasStarted, sessionId, messages.length, startSession]);

    const handleClosePopup = () => {
        setIsPopupOpen(false);
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
            {isPopupOpen && <Popup handleClose={handleClosePopup} />}
            <div className="h-screen flex flex-col" style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize:'cover', backgroundPosition:'center' }}>
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
                    
                    <Chat messages={messages} />
                    
                    {isComplete && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-forest text-white rounded-lg hover:bg-green-700 transition-colors font-space-mono"
                            >
                                Start New Story
                            </button>
                        </div>
                    )}
                </div>
                
                <div className='sm:px-10 py-4'>
                    <ChatInput 
                        placeholder={getPlaceholderText()}
                        value={userInput}
                        onChange={handleInputChange}
                        onClick={handleSubmit}
                        disabled={isLoading || isComplete}
                    />
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default Intake