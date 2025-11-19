import { useState, useEffect, useCallback } from 'react';
import { storyAPI, StorySession } from '../api';

export interface ChatMessage {
  type: 'user' | 'assistant';
  message: string;
  isLoading?: boolean;
  isError?: boolean;
  images?: string[];
  videoUrl?: string;
  isEditable?: boolean;
  isEditing?: boolean;
  shouldScrollTo?: boolean; // Flag to trigger scroll when video is ready
}

export interface ChatState {
  messages: ChatMessage[];
  currentQuestion: number;
  totalQuestions: number;
  sessionId: string | null;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  showGenerateButton: boolean;
  videoGenerated: boolean;
  videoGenerating: boolean; // Track when video generation has started
  tempEmail: string | null; // Store email temporarily until video generation
  hasEmailForSupabase: boolean; // Track if email was provided for Supabase save
}

const SESSION_STORAGE_KEY = 'story-catcher-session';

// Helper function to find insertion point for video messages (right after storyboard)
const findVideoInsertionIndex = (messages: ChatMessage[]): number => {
  // Find storyboard message index
  const storyboardIndex = messages.findIndex(msg =>
    msg.type === 'assistant' &&
    msg.message.includes('**Storyboard:') &&
    !msg.isLoading
  );

  if (storyboardIndex === -1) {
    // No storyboard found, append to end
    return messages.length;
  }

  // Insert right after storyboard (newest videos appear first)
  return storyboardIndex + 1;
};

export const useStoryChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentQuestion: 0,
    totalQuestions: 4,
    sessionId: null,
    isComplete: false,
    isLoading: false,
    error: null,
    showGenerateButton: false,
    videoGenerated: false,
    videoGenerating: false,
    tempEmail: null,
    hasEmailForSupabase: false,
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
    } catch {
      return false;
    }
  }, []);

  // Start a new story session
  const startSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if backend is available
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not available. Please check the server status.');
      }

      const session: StorySession = await storyAPI.startSession();

      setState(prev => ({
        ...prev,
        sessionId: session.session_id,
        currentQuestion: session.question_number || 1,
        totalQuestions: session.total_questions || 4,
        messages: [
          { type: 'assistant', message: session.message },
          { type: 'assistant', message: session.question || '' }
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

  // Poll for storyboard completion
  const pollStoryboardStatus = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      const result = await storyAPI.checkStoryboardStatus(state.sessionId);

      if (result.success && result.status === 'completed' && result.storyboard) {
        // Replace the loading message with the completed storyboard
        setState(prev => ({
          ...prev,
          showGenerateButton: true, // Show generate button when storyboard is complete
          messages: prev.messages.map((msg, index) =>
            index === prev.messages.length - 1 && msg.isLoading
              ? {
                type: 'assistant',
                message: result.storyboard!,
                isEditable: true
              }
              : msg
          )
        }));
      } else if (result.success && result.status === 'generating') {
        // Continue polling
        setTimeout(() => pollStoryboardStatus(), 2000);
      }
    } catch (error) {
      console.error('Error polling storyboard status:', error);
    }
  }, [state.sessionId]);

  // Poll video status until completion
  const pollVideoStatus = useCallback(async (videoUrl: string, hasEmailForSupabase?: boolean) => {
    if (!videoUrl.startsWith('videogen://')) return;

    const apiFileId = videoUrl.replace('videogen://', '');

    const checkStatus = async () => {
      try {
        const result = await storyAPI.checkVideoStatus(apiFileId);

        if (result.success && result.result) {
          const loadingState = result.result.loadingState;

          if (loadingState === 'FULFILLED') {
            const finalVideoUrl = result.result.apiFileSignedUrl;
            if (finalVideoUrl) {
              // Save final video URL to Supabase if session exists AND email was provided
              let supabaseSaveSuccess = true;
              const shouldSaveToSupabase = hasEmailForSupabase !== undefined ? hasEmailForSupabase : state.hasEmailForSupabase;

              if (state.sessionId && shouldSaveToSupabase) {
                try {
                  const saveResult = await storyAPI.saveVideoToSupabase(state.sessionId, finalVideoUrl);
                  if (!saveResult.success) {
                    console.warn('Video saved but Supabase save failed:', saveResult.error);
                    supabaseSaveSuccess = false;
                  }
                } catch (error) {
                  console.error('Failed to save video to Supabase:', error);
                  supabaseSaveSuccess = false;
                }
              } else if (state.sessionId && !shouldSaveToSupabase) {
                supabaseSaveSuccess = true;
              }

              // Update the loading message with the completed video
              setState(prev => {
                return {
                  ...prev,
                  videoGenerated: true,
                  videoGenerating: false,
                  messages: prev.messages.map(msg =>
                    msg.videoUrl === videoUrl
                      ? {
                        ...msg,
                        videoUrl: finalVideoUrl,
                        isLoading: false,
                        shouldScrollTo: true,
                        message: supabaseSaveSuccess
                          ? (shouldSaveToSupabase
                            ? 'Your video is ready!'
                            : 'Your video is ready! (Saved locally - no email provided for database storage)')
                          : 'Your video is ready! (Note: Video saved locally but not to our database)'
                      }
                      : msg
                  )
                };
              });
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
        setTimeout(checkStatus, 20000);
      }
    };

    setTimeout(checkStatus, 5000);
  }, [state.sessionId, state.hasEmailForSupabase]);

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
        answer
      );

      const newMessages: ChatMessage[] = [
        { type: 'assistant', message: session.message }
      ];

      // If session is complete, add the storyboard (no video yet)
      if (session.session_complete) {
        if (session.storyboard_generating) {
          // Storyboard is still generating, add polling message
          newMessages.push({
            type: 'assistant',
            message: 'Generating your storyboard...',
            isLoading: true
          });
        } else if (session.storyboard) {
          newMessages.push({
            type: 'assistant',
            message: session.storyboard,
            isEditable: true
          });
        }
      } else if (session.question) {
        // Add the next question
        newMessages.push({
          type: 'assistant',
          message: session.question
        });
      }

      setState(prev => {
        // Calculate how many messages to keep (remove loading message if it exists)
        const messagesToKeep = state.currentQuestion === 4 ? prev.messages.length - 1 : prev.messages.length;

        const newState = {
          ...prev,
          currentQuestion: session.question_number || prev.currentQuestion + 1,
          totalQuestions: session.total_questions || prev.totalQuestions,
          isComplete: session.session_complete || false,
          showGenerateButton: session.session_complete ? true : prev.showGenerateButton,
          // Keep user message, remove loading message, add new response
          messages: [
            ...prev.messages.slice(0, messagesToKeep),
            ...newMessages
          ],
          isLoading: false,
          error: null,
        };

        // Start polling if storyboard is generating
        if (session.storyboard_generating) {
          setTimeout(() => pollStoryboardStatus(), 1000);
        }

        return newState;
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
  }, [state.sessionId, state.currentQuestion, state.isComplete, pollStoryboardStatus]);

  // Store email temporarily (from popup)
  const storeEmail = useCallback((email?: string) => {
    setState(prev => ({
      ...prev,
      tempEmail: email || null,
      hasEmailForSupabase: !!email // Track if email was provided
    }));
  }, []);

  // Generate video from completed session (from Generate Video button)
  const generateVideo = useCallback(async (email?: string) => {
    if (!state.sessionId) return;

    // Use provided email or fall back to stored email
    const emailToUse = email || state.tempEmail;
    const hasEmail = !!emailToUse;

    // Find storyboard message index
    const storyboardIndex = state.messages.findIndex(msg =>
      msg.type === 'assistant' &&
      msg.message.includes('**Storyboard:') &&
      !msg.isLoading
    );

    if (storyboardIndex === -1) return;
    const storyboardMsg = state.messages[storyboardIndex];
    const storyboardMessageText = storyboardMsg.message;

    // Disable editing during generation
    setState(prev => {
      // Insert loading message immediately after storyboard
      const newMessages = [...prev.messages];
      const loadingMessage: ChatMessage = {
        type: 'assistant',
        message: 'Your video is generating...',
        isLoading: true
      };

      newMessages.splice(storyboardIndex + 1, 0, loadingMessage);

      return {
        ...prev,
        videoGenerating: true,
        messages: newMessages
      };
    });

    try {
      // Check if storyboard was edited and use the latest text
      let result;
      if (storyboardMessageText) {
        // User edited the storyboard - use the edited text
        console.log('Using edited storyboard for video generation');
        result = await storyAPI.generateVideoFromEditedStoryboard(storyboardMessageText, state.sessionId, emailToUse || undefined);
      } else {
        // No edits - use the original VideoGen outline
        console.log('Using original outline for video generation');
        result = await storyAPI.generateVideoWithVideoGenOutline(state.sessionId, emailToUse || undefined);
      }

      if (result.success && result.video_url) {
        // Update the loading message with the video URL (for polling)
        setState(prev => {
          const updatedMessages = prev.messages.map((msg, idx) => {
            // We assume the loading message is still at storyboardIndex + 1
            // But to be safe, we look for the loading message we just added
            if (idx === storyboardIndex + 1 && msg.isLoading && !msg.videoUrl) {
              return {
                ...msg,
                videoUrl: result.video_url
              };
            }
            return msg;
          });

          return {
            ...prev,
            messages: updatedMessages
          };
        });

        // Check if it's a videogen:// URL that needs polling
        if (result.video_url.startsWith('videogen://')) {
          // Start polling for video completion
          pollVideoStatus(result.video_url, hasEmail);
        } else {
          // Direct video URL, mark as generated and update message
          setState(prev => ({
            ...prev,
            videoGenerated: true,
            videoGenerating: false,
            messages: prev.messages.map((msg, idx) =>
              idx === storyboardIndex + 1
                ? {
                  ...msg,
                  message: 'Your video is ready!',
                  isLoading: false,
                  shouldScrollTo: true
                }
                : msg
            )
          }));
        }
      } else {
        throw new Error(result.error || 'Video generation failed');
      }
    } catch {
      setState(prev => {
        // Remove the loading message on error
        const newMessages = prev.messages.filter((_, idx) => idx !== storyboardIndex + 1);

        return {
          ...prev,
          showGenerateButton: true,
          videoGenerating: false,
          messages: [
            ...newMessages,
            {
              type: 'assistant',
              message: 'Sorry, video generation failed. Please try again.',
              isError: true
            }
          ]
        };
      });
    }
  }, [state.sessionId, state.messages, state.tempEmail, pollVideoStatus]);

  // Edit a message
  const editMessage = useCallback((messageIndex: number, newMessage: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) =>
        index === messageIndex
          ? { ...msg, message: newMessage, isEditing: false }
          : msg
      ),
      showGenerateButton: true // Show generate button after editing
    }));
  }, []);

  // Start editing a message
  const startEditing = useCallback((messageIndex: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) =>
        index === messageIndex
          ? { ...msg, isEditing: true }
          : { ...msg, isEditing: false }
      )
    }));
  }, []);

  // Cancel editing
  const cancelEditing = useCallback((messageIndex: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) =>
        index === messageIndex
          ? { ...msg, isEditing: false }
          : msg
      )
    }));
  }, []);

  // Show generate button
  const setShowGenerateButton = useCallback(() => {
    setState(prev => ({ ...prev, showGenerateButton: true }));
  }, []);

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
      showGenerateButton: false,
      videoGenerated: false,
      videoGenerating: false,
      tempEmail: null,
      hasEmailForSupabase: false,
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
    storeEmail,
    generateVideo,
    editMessage,
    startEditing,
    cancelEditing,
    setShowGenerateButton,
    pollStoryboardStatus,
    resetSession,
    clearError,
    checkBackendHealth,
  };
};
