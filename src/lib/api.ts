// API service for communicating with Story Catcher Backend
// Environment-based API URL configuration
const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // If NEXT_PUBLIC_API_URL is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Auto-detect based on environment
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  }
  
  // Production fallback
  return 'https://story-catcher-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface StorySession {
  session_id: string;
  message: string;
  question?: {
    id: number;
    text: string;
    category: string;
    order: number;
  };
  question_number?: number;
  total_questions?: number;
  session_complete?: boolean;
  storyboard?: string;
  images?: string[];
  video_url?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  session_id?: string;
  question?: {
    id: number;
    text: string;
    category: string;
    order: number;
  };
  question_number?: number;
  total_questions?: number;
  session_complete?: boolean;
  storyboard?: string;
  images?: string[];
  video_url?: string;
}

class StoryCatcherAPI {
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Check if backend is running
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.success || (response as { status?: string }).status === 'healthy';
    } catch {
      return false;
    }
  }

  // Start a new story session
  async startSession(message: string): Promise<StorySession> {
    const response = await this.makeRequest('/story/start', 'POST', { message });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to start session');
    }

    return {
      session_id: response.session_id!,
      message: response.message!,
      question: response.question,
      question_number: response.question_number,
      total_questions: response.total_questions,
      session_complete: response.session_complete || false,
    };
  }

  // Submit an answer to a question
  async submitAnswer(sessionId: string, answer: string, questionNumber: number): Promise<StorySession> {
    const response = await this.makeRequest('/story/answer', 'POST', {
      session_id: sessionId,
      answer,
      question_number: questionNumber,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to submit answer');
    }

    return {
      session_id: sessionId,
      message: response.message!,
      question: response.question,
      question_number: response.question_number,
      total_questions: response.total_questions,
      session_complete: response.session_complete || false,
      storyboard: response.storyboard,
      images: response.images,
      video_url: response.video_url,
    };
  }

  // Get current question for a session
  async getCurrentQuestion(sessionId: string): Promise<StorySession> {
    const response = await this.makeRequest(`/story/current-question/${sessionId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get current question');
    }

    return {
      session_id: sessionId,
      message: response.message || '',
      question: response.question,
      question_number: response.question_number,
      total_questions: response.total_questions,
      session_complete: response.session_complete || false,
    };
  }

  // Get session status
  async getSessionStatus(sessionId: string): Promise<StorySession> {
    const response = await this.makeRequest(`/story/session/${sessionId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get session status');
    }

    return (response as unknown as { session_data: StorySession }).session_data;
  }

  // Check video status
  async checkVideoStatus(apiFileId: string): Promise<{ success: boolean; result?: { loadingState: string; apiFileSignedUrl?: string }; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/video/status/${apiFileId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Video status check failed:', error);
      return { success: false, error: 'Failed to check video status' };
    }
  }
}

export const storyAPI = new StoryCatcherAPI();
