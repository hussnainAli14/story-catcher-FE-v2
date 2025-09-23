import { useState, useEffect, useCallback } from 'react';
import { storyAPI, StorySession } from '../api';

export interface ChatMessage {
  type: 'user' | 'assistant';
  message: string;
  isLoading?: boolean;
  isError?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  currentQuestion: number;
  totalQuestions: number;
  sessionId: string | null;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

const SESSION_STORAGE_KEY = 'story-catcher-session';

export const useStoryChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentQuestion: 0,
    totalQuestions: 4,
    sessionId: null,
    isComplete: false,
    isLoading: false,
    error: null,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        setState(prev => ({
          ...prev,
          sessionId: sessionData.sessionId,
          currentQuestion: sessionData.currentQuestion || 0,
        }));
      } catch (error) {
        console.error('Failed to load session from localStorage:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        sessionId: state.sessionId,
        currentQuestion: state.currentQuestion,
      }));
    }
  }, [state.sessionId, state.currentQuestion]);

  // Check backend health
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      return await storyAPI.checkHealth();
    } catch (error) {
      return false;
    }
  }, []);

  // Start a new story session
  const startSession = useCallback(async (message: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if backend is available
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not available. Please make sure the server is running on localhost:5000');
      }

      const session: StorySession = await storyAPI.startSession(message);
      
      setState(prev => ({
        ...prev,
        sessionId: session.session_id,
        currentQuestion: session.question_number || 1,
        totalQuestions: session.total_questions || 4,
        messages: [
          { type: 'assistant', message: session.message },
          { type: 'assistant', message: session.question?.text || '' }
        ],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        messages: [
          ...prev.messages,
          { type: 'assistant', message: 'Sorry, I encountered an error. Please try again.', isError: true }
        ]
      }));
    }
  }, [checkBackendHealth]);

  // Submit an answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!state.sessionId || state.isComplete) return;

    // Add user message and loading indicator
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      messages: [
        ...prev.messages, 
        { type: 'user', message: answer },
        // Show loading message if this is the 4th question (storyboard generation)
        ...(state.currentQuestion === 4 ? [{
          type: 'assistant' as const,
          message: 'Generating your storyboard...',
          isLoading: true
        }] : [])
      ]
    }));

    try {
      const session: StorySession = await storyAPI.submitAnswer(
        state.sessionId, 
        answer, 
        state.currentQuestion
      );

      const newMessages: ChatMessage[] = [
        { type: 'assistant', message: session.message }
      ];

      // If session is complete, add the storyboard
      if (session.session_complete && session.storyboard) {
        newMessages.push({ 
          type: 'assistant', 
          message: session.storyboard 
        });
      } else if (session.question) {
        // Add the next question
        newMessages.push({ 
          type: 'assistant', 
          message: session.question.text 
        });
      }


      setState(prev => {
        // Calculate how many messages to keep (remove loading message if it exists)
        const messagesToKeep = state.currentQuestion === 4 ? prev.messages.length - 1 : prev.messages.length;
        
        return {
          ...prev,
          currentQuestion: session.question_number || prev.currentQuestion + 1,
          totalQuestions: session.total_questions || prev.totalQuestions,
          isComplete: session.session_complete || false,
          // Keep user message, remove loading message, add new response
          messages: [
            ...prev.messages.slice(0, messagesToKeep),
            ...newMessages
          ],
          isLoading: false,
          error: null,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      setState(prev => {
        // Calculate how many messages to keep (remove loading message if it exists)
        const messagesToKeep = state.currentQuestion === 4 ? prev.messages.length - 1 : prev.messages.length;
        
        return {
          ...prev,
          isLoading: false,
          error: errorMessage,
          // Keep user message, remove loading message, add error message
          messages: [
            ...prev.messages.slice(0, messagesToKeep),
            { type: 'assistant', message: 'Sorry, I encountered an error. Please try again.', isError: true }
          ]
        };
      });
    }
  }, [state.sessionId, state.currentQuestion, state.isComplete]);

  // Reset the session
  const resetSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setState({
      messages: [],
      currentQuestion: 0,
      totalQuestions: 4,
      sessionId: null,
      isComplete: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startSession,
    submitAnswer,
    resetSession,
    clearError,
    checkBackendHealth,
  };
};
