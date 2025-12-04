import { useState, useEffect, useCallback } from 'react';
import { storyAPI, StorySession } from '../api';

export interface ChatMessage {
  id: string;
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
  email?: string; // Store confirmed email
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
          { id: crypto.randomUUID(), type: 'assistant', message: session.message },
          { id: crypto.randomUUID(), type: 'assistant', message: session.question || '' }
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
          { id: crypto.randomUUID(), type: 'assistant', message: 'Sorry, I encountered an error. Please try again.', isError: true }
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
                ...msg,
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
  const pollVideoStatus = useCallback(async (videoUrl: string, hasEmailForSupabase?: boolean, userEmail?: string) => {
    if (!videoUrl.startsWith('videogen://')) return;

    const apiFileId = videoUrl.replace('videogen://', '');

    const checkStatus = async () => {
      try {
        const result = await storyAPI.checkVideoStatus(apiFileId);

        if (result.success && result.result) {
          const loadingState = result.result.loadingState;

          if (loadingState === 'FULFILLED') {
            // Video is ready! Trigger backend to download and store it permanently
            const shouldSaveToSupabase = hasEmailForSupabase !== undefined ? hasEmailForSupabase : state.hasEmailForSupabase;
            let finalVideoUrl = result.result.apiFileSignedUrl || '';
            let supabaseSaveSuccess = false;

            if (state.sessionId) {
              // Call the new endpoint to download and store the video
              // This works for both authenticated and anonymous users
              const emailToSave = userEmail || (hasEmailForSupabase !== undefined ? (hasEmailForSupabase ? state.email : undefined) : (state.hasEmailForSupabase ? state.email : undefined));

              try {
                console.log('[pollVideoStatus] Saving video with email:', emailToSave, 'userEmail param:', userEmail, 'state.email:', state.email, 'hasEmailForSupabase:', hasEmailForSupabase, 'state.hasEmailForSupabase:', state.hasEmailForSupabase);
                const storeResult = await storyAPI.processAndStoreVideo(apiFileId, state.sessionId, emailToSave);

                if (storeResult.success && storeResult.permanent_url) {
                  // Keep using the temporary URL for immediate playback reliability
                  // The permanent URL is saved in the database for future access
                  // finalVideoUrl = storeResult.permanent_url; 
                  console.log('Video saved permanently to:', storeResult.permanent_url);
                  supabaseSaveSuccess = true;
                } else {
                  console.warn('Video processed but storage failed:', storeResult.error);
                  // Fallback to the signed URL if storage fails
                  supabaseSaveSuccess = false;

                  // Try to save just the link as a fallback
                  if (finalVideoUrl) {
                    await storyAPI.saveVideoToSupabase(state.sessionId, finalVideoUrl, emailToSave);
                  }
                }
              } catch (error) {
                console.error('Failed to process and store video:', error);
                supabaseSaveSuccess = false;

                // Try to save just the link as a fallback
                if (finalVideoUrl) {
                  try {
                    await storyAPI.saveVideoToSupabase(state.sessionId, finalVideoUrl, emailToSave);
                  } catch (e) {
                    console.error('Fallback save failed:', e);
                  }
                }
              }
            }

            if (finalVideoUrl) {
              // Remove the loading message and insert completed video at correct position
              setState(prev => {
                // Remove the loading message (find the one with matching videogen URL)
                const messagesWithoutLoading = prev.messages.filter(msg =>
                  !(msg.videoUrl === videoUrl && msg.isLoading)
                );

                // Find insertion point (right after storyboard)
                const insertIndex = findVideoInsertionIndex(messagesWithoutLoading);

                // Create the completed video message
                const completedVideoMessage: ChatMessage = {
                  id: crypto.randomUUID(),
                  type: 'assistant',
                  message: supabaseSaveSuccess
                    ? 'Your video is ready! (Saved permanently)'
                    : 'Your video is ready! (Note: Video saved locally but could not be stored permanently)',
                  videoUrl: finalVideoUrl,
                  isLoading: false,
                  shouldScrollTo: true // Flag to trigger auto-scroll
                };

                // Insert video message at correct position
                const newMessages = [
                  ...messagesWithoutLoading.slice(0, insertIndex),
                  completedVideoMessage,
                  ...messagesWithoutLoading.slice(insertIndex)
                ];

                return {
                  ...prev,
                  videoGenerated: true, // Mark video as generated
                  videoGenerating: false, // Reset video generating state
                  messages: newMessages
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
        { id: crypto.randomUUID(), type: 'user', message: answer },
        // Show loading message if this is the 4th question (storyboard generation)
        ...(state.currentQuestion === 4 ? [{
          id: crypto.randomUUID(),
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
        { id: crypto.randomUUID(), type: 'assistant', message: session.message }
      ];

      // If session is complete, add the storyboard (no video yet)
      if (session.session_complete) {
        if (session.storyboard_generating) {
          // Storyboard is still generating, add polling message
          newMessages.push({
            id: crypto.randomUUID(),
            type: 'assistant',
            message: 'Generating your storyboard...',
            isLoading: true
          });
        } else if (session.storyboard) {
          newMessages.push({
            id: crypto.randomUUID(),
            type: 'assistant',
            message: session.storyboard,
            isEditable: true
          });
        }
      } else if (session.question) {
        // Add the next question
        newMessages.push({
          id: crypto.randomUUID(),
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
            { id: crypto.randomUUID(), type: 'assistant', message: 'Sorry, I encountered an error. Please try again.', isError: true }
          ]
        };
      });
    }
  }, [state.sessionId, state.currentQuestion, state.isComplete, pollStoryboardStatus]);

  // Store email temporarily (from popup)
  const storeEmail = useCallback((email?: string) => {
    console.log('[storeEmail] Storing email:', email);
    setState(prev => ({
      ...prev,
      tempEmail: email || null,
      email: email,
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
      // Append loading message to the end
      const loadingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        message: 'Your video is generating...',
        isLoading: true
      };

      return {
        ...prev,
        videoGenerating: true,
        email: emailToUse || undefined,
        hasEmailForSupabase: hasEmail,
        messages: [...prev.messages, loadingMessage]
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
          // Update the last message (which should be the loading message we just added)
          const updatedMessages = [...prev.messages];
          const lastIdx = updatedMessages.length - 1;

          if (lastIdx >= 0 && updatedMessages[lastIdx].isLoading) {
            updatedMessages[lastIdx] = {
              ...updatedMessages[lastIdx],
              videoUrl: result.video_url
            };
          }

          return {
            ...prev,
            messages: updatedMessages
          };
        });

        // Check if it's a videogen:// URL that needs polling
        if (result.video_url.startsWith('videogen://')) {
          // Start polling for video completion
          pollVideoStatus(result.video_url, hasEmail, emailToUse || undefined);
        } else {
          // Direct video URL, show immediately at correct position (below storyboard)
          setState(prev => {
            // Remove the loading message (last one)
            const messagesWithoutLoading = prev.messages.slice(0, -1);

            // Find insertion point (right after storyboard)
            const insertIndex = findVideoInsertionIndex(messagesWithoutLoading);

            // Create completed video message
            const completedVideoMessage: ChatMessage = {
              id: crypto.randomUUID(),
              type: 'assistant',
              message: 'Your video is ready!',
              videoUrl: result.video_url,
              isLoading: false,
              shouldScrollTo: true
            };

            // Insert completed video message at correct position
            const newMessages = [
              ...messagesWithoutLoading.slice(0, insertIndex),
              completedVideoMessage,
              ...messagesWithoutLoading.slice(insertIndex)
            ];

            return {
              ...prev,
              videoGenerated: true, // Mark video as generated
              videoGenerating: false, // Reset video generating state
              messages: newMessages
            };
          });
        }
      } else {
        throw new Error(result.error || 'Video generation failed');
      }
    } catch {
      setState(prev => {
        // Remove the loading message on error (last one)
        const messagesToKeep = prev.messages.length - 1;

        return {
          ...prev,
          showGenerateButton: true,
          videoGenerating: false,
          messages: [
            ...prev.messages.slice(0, messagesToKeep),
            {
              id: crypto.randomUUID(),
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
