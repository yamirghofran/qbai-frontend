import apiClient from './client';
import { Quiz, QuizListItem, QuizAttempt, UserAttempt, PublicQuizFeedItem } from '../types'; // Import QuizListItem, QuizAttempt, AttemptAnswer, UserAttempt, PublicQuizFeedItem

// Type for upload response from backend
interface UploadResponse {
  quizId: string; // Changed to match actual backend response key
  title: string;
  message: string;
}

// Type for quiz list response (Note: Backend currently returns QuizListItem[], not this structure)
// interface QuizListResponse {
//   quizzes: QuizListItem[]; // Changed from Quiz[] to QuizListItem[]
//   total: number;
// }

// Type for the response when creating an attempt
interface CreateAttemptResponse {
  attemptId: string;
}

// Type for the request body when saving an answer
interface SaveAnswerRequest {
  questionId: string;
  selectedAnswerId: string;
}

// Type for the response when finishing an attempt
interface FinishAttemptResponse {
  message: string;
  score: number;
}


// Quiz API service
const quizService = {
  // Upload files and YouTube URLs to generate a quiz
  uploadContent: async (data: { 
    files: File[]; 
    youtubeUrls: string[];
    maxQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
    customPrompt?: string;
  }): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Required fields
    data.files.forEach((file) => {
      formData.append('files', file); // Corrected key to match backend expectation
    });
    data.youtubeUrls.forEach((url) => {
      formData.append('videoUrls', url); // Corrected key to match backend expectation
    });

    // Optional customization fields
    if (data.maxQuestions) {
      formData.append('max_questions', data.maxQuestions.toString());
    }
    if (data.difficulty) {
      formData.append('difficulty', data.difficulty);
    }
    if (data.customPrompt && data.customPrompt.trim()) {
      formData.append('custom_prompt', data.customPrompt.trim());
    }

    // Corrected endpoint to match backend route
    const response = await apiClient.post<UploadResponse>('/quizzes/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all quizzes (created by the user)
  // Note: Backend returns QuizListItem[] directly now
  listUserQuizzes: async (): Promise<QuizListItem[]> => {
    try {
      const response = await apiClient.get<QuizListItem[]>('/quizzes'); // Use the new type
      console.log("Fetched user quizzes:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      // Re-throw or handle error as appropriate for your application
      throw error;
    }
  },

  // Get all public quizzes for the feed
  listPublicQuizzes: async (): Promise<PublicQuizFeedItem[]> => {
    try {
      const response = await apiClient.get<PublicQuizFeedItem[]>('/quizzes/feed');
      console.log("Fetched public quizzes:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching public quizzes:', error);
      throw error;
    }
  },

  // Get a specific quiz by ID (including questions and options)
  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },

  // Update a quiz (Not implemented in backend yet)
  // updateQuiz: async (quiz: Quiz): Promise<Quiz> => {
  //   const response = await apiClient.put<Quiz>(`/quizzes/${quiz.id}`, quiz);
  //   return response.data;
  // },

  // Delete a quiz
  deleteQuiz: async (id: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${id}`);
  },

  // --- Quiz Attempt Functions ---

  // Create a new quiz attempt
  createQuizAttempt: async (quizId: string): Promise<CreateAttemptResponse> => {
    try {
      const response = await apiClient.post<CreateAttemptResponse>(`/quizzes/${quizId}/attempts`);
      console.log("Created quiz attempt:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error creating quiz attempt for quiz ${quizId}:`, error);
      throw error;
    }
  },

  // Get details of a specific quiz attempt (including saved answers)
  getQuizAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    try {
      const response = await apiClient.get<QuizAttempt>(`/attempts/${attemptId}`);
      console.log("Fetched quiz attempt details:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz attempt ${attemptId}:`, error);
      throw error;
    }
  },

  // Save (upsert) an answer for a specific question within an attempt
  saveAttemptAnswer: async (attemptId: string, questionId: string, selectedAnswerId: string): Promise<void> => {
    try {
      const payload: SaveAnswerRequest = { questionId, selectedAnswerId };
      await apiClient.post(`/attempts/${attemptId}/answers`, payload);
      console.log(`Saved answer for attempt ${attemptId}, question ${questionId}`);
    } catch (error) {
      console.error(`Error saving answer for attempt ${attemptId}, question ${questionId}:`, error);
      throw error;
    }
  },

  // Finish a quiz attempt and get the final score
  finishQuizAttempt: async (attemptId: string): Promise<FinishAttemptResponse> => {
    try {
      const response = await apiClient.post<FinishAttemptResponse>(`/attempts/${attemptId}/finish`);
      console.log(`Finished quiz attempt ${attemptId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error finishing quiz attempt ${attemptId}:`, error);
      throw error;
    }
  },

  // List all attempts for the current user
  listUserAttempts: async (): Promise<UserAttempt[]> => {
    try {
      const response = await apiClient.get<UserAttempt[]>('/attempts');
      console.log("Fetched user attempts:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      throw error;
    }
  },

};

export default quizService;
