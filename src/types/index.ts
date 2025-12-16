// frontend/src/types/index.ts
export interface UserProfile {
  id: string; // This is the Google ID in the current backend implementation
  google_id?: string; // Potentially redundant if id is Google ID, or could be internal DB ID
  email: string;
  name: string;
  picture?: string; // Add optional picture URL field
}

// You might also want a type for the /auth/status response
export interface AuthStatusResponse {
  authenticated: boolean;
  user?: UserProfile; // User is optional, only present if authenticated
}

// Type for the list of quizzes returned by GET /api/quizzes
export interface QuizListItem {
 id: string; // UUID as string
 title: string;
 created_at: string; // ISO 8601 date string
 updated_at: string; // ISO 8601 date string
}

// Type for public quiz feed items with creator info
export interface PublicQuizFeedItem {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  creator_name?: string | null;
  creator_picture?: string | null;
}

// Quiz type (updated to include creator info)
export interface Quiz {
    id: string;
    title: string;
    description?: string | null;
    visibility?: string;
    questions: Question[];
    created_at: string;
    updated_at: string;
    creator_name?: string | null;    // Added optional creator name
    creator_picture?: string | null; // Added optional creator picture URL
  }
  
  // Question type
  export interface Question {
    id: string;
    quiz_id?: string;
    text: string;
    options: Option[];
    topic_title?: string | null; // Added optional topic title
    created_at?: string; // Make optional if not always present
    updated_at?: string; // Make optional if not always present
  }
  
  // Option type
  export interface Option {
    id: string;
    question_id?: string;
    text: string;
    is_correct: boolean;
    explanation?: string | null; // Added optional explanation
    created_at?: string; // Make optional if not always present
    updated_at?: string; // Make optional if not always present
  }
  
  // File type (If still relevant, otherwise can be removed)
  export interface File {
    id: string;
    quiz_id: string;
    file_name: string;
    file_size: number;
    created_at: string;
  }
  
  // User answer type for quiz taking (Local state, might be replaced/augmented by AttemptAnswer)
  export interface UserAnswer {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }
  
  // Quiz result type (May need adjustment based on final attempt structure)
  export interface QuizResult {
    quizId: string;
    totalQuestions: number;
    correctAnswers: number;
    userAnswers: UserAnswer[]; // Or AttemptAnswer[]?
    completedAt: string;
  }

// --- New Types for Quiz Attempts ---

// Represents a single saved answer within a quiz attempt
export interface AttemptAnswer {
  question_id: string;       // UUID of the question
  selected_answer_id: string; // UUID of the answer the user selected
  is_correct: boolean;       // Whether the selected answer was correct
}

// Represents the overall state of a quiz attempt
export interface QuizAttempt {
  id: string;                // UUID of the attempt
  quiz_id: string;           // UUID of the quiz being attempted
  user_id: string;           // UUID of the user attempting the quiz
  score: number | null;      // Final score (null if not finished)
  start_time: string;        // ISO 8601 timestamp when the attempt started
  end_time: string | null;   // ISO 8601 timestamp when the attempt finished (null if ongoing)
  answers: AttemptAnswer[];  // Array of answers saved so far for this attempt
}

// Represents a user's attempt entry for the attempts list page
export interface UserAttempt {
  attempt_id: string;      // UUID of the attempt
  quiz_id: string;         // UUID of the quiz
  start_time: string;      // ISO 8601 timestamp when the attempt started
  score: number | null;    // Raw score (number of correct answers), null if not finished
  quiz_name: string;       // Title of the quiz attempted
  total_questions: number; // Total number of questions in the quiz
}