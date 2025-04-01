import { useState, useMemo } from "react"; // Import useEffect and useMemo
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Quiz, Question as QuizDataQuestion, QuizAttempt } from "@/types"; // Import Quiz types and QuizAttempt, AttemptAnswer
import quizService from "@/api/quizservice"; // Import quizService
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate

interface QuizInterfaceProps {
  quiz: Quiz;
  attempt: QuizAttempt; // Add the full attempt object
  attemptId: string;    // Add the attempt ID string
  // Add any other props needed, e.g., onSubmit
}

// Note: The internal QuizOption and QuizQuestion interfaces are removed
// as we will use the imported types QuizDataQuestion and QuizDataOption directly or via quiz.questions

export default function QuizInterface({ quiz, attempt, attemptId }: QuizInterfaceProps) {
  // console.log("QuizInterface: Rendering START", { quizId: quiz?.id, attemptId }); // Removed log
  const navigate = useNavigate();
  const totalQuestions = quiz.questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Store all selected answers { questionId: selectedAnswerId }
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    const initialAnswers: Record<string, string> = {};
    // Ensure attempt.answers is an array before iterating
    if (attempt && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(ans => {
          // Ensure ans and its properties exist (optional chaining for safety)
          if (ans?.question_id && ans?.selected_answer_id) {
             initialAnswers[ans.question_id] = ans.selected_answer_id;
          }
        });
    }
    return initialAnswers;
  });

  // Derived state for the current question's selected option
  const selectedOptionId = useMemo(() => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    return userAnswers[currentQuestion.id] || null;
  }, [currentQuestionIndex, userAnswers, quiz.questions]);

  // Derived state: is the *current* question answered?
  const isAnswered = selectedOptionId !== null;

  const [isSubmitting, setIsSubmitting] = useState(false); // For API calls
  const [error, setError] = useState<string | null>(null); // For API errors

  if (!quiz || !quiz.questions || totalQuestions === 0) {
    return <div>Error: Invalid quiz data provided.</div>; // Handle invalid/empty quiz
  }

  const currentQuestion: QuizDataQuestion = quiz.questions[currentQuestionIndex];
  // Progress based on index (0-based index + 1 for 1-based question number)
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = async (optionId: string) => {
    if (isSubmitting) return; // Prevent multiple submissions

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const questionId = currentQuestion.id;

    // Optimistically update UI state
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setError(null);
    setIsSubmitting(true);

    try {
      await quizService.saveAttemptAnswer(attemptId, questionId, optionId);
      console.log(`Successfully saved answer for Q:${questionId} A:${optionId}`);
    } catch (err) {
      console.error("Failed to save answer:", err);
      setError(err instanceof Error ? err.message : "Failed to save answer.");
      // Revert optimistic update on error? Or show error message?
      // For now, just show error message. User can try again.
      // setUserAnswers(prev => {
      //   const newState = { ...prev };
      //   delete newState[questionId]; // Revert if needed
      //   return newState;
      // });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setError(null); // Clear previous errors
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // State for selectedOptionId and isAnswered is now derived, no need to reset here
    } else {
      // Finish Quiz
      setIsSubmitting(true);
      try {
        const result = await quizService.finishQuizAttempt(attemptId);
        console.log("Quiz finished successfully!", result);
        // Navigate to the summary page
        navigate({
          to: '/quiz/$quizId/attempt/$attemptId/summary',
          params: { quizId: quiz.id, attemptId }
        });
      } catch (err) {
        console.error("Failed to finish quiz:", err);
        setError(err instanceof Error ? err.message : "Failed to finish quiz.");
        setIsSubmitting(false);
      }
      // No need to set isSubmitting false on success if navigating away
    }
  };

  const handlePreviousQuestion = () => {
    setError(null); // Clear previous errors
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // State for selectedOptionId and isAnswered is now derived, no need to reset here
    }
  };

  // console.log("QuizInterface: Rendering RETURN", { currentQuestionIndex }); // Removed log
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Use quiz title from props */}
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="text-sm text-muted-foreground mb-6">
        {/* Use index + 1 for display */}
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </div>

      <Card className="mb-6">
        <CardHeader>
          {/* Use question text from props */}
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span>{currentQuestion.text}</span>
            {currentQuestion.topic_title && (
              <Badge variant="secondary">{currentQuestion.topic_title}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            // Calculate options content before returning JSX
            if (currentQuestion.options && Array.isArray(currentQuestion.options)) {
              return currentQuestion.options.map((option) => {
                const isSelected = userAnswers[currentQuestion.id] === option.id;
                const currentQuestionAnswered = userAnswers[currentQuestion.id] !== undefined;
                const isCorrectOption = option.is_correct;
                const showCorrectIndicator = currentQuestionAnswered && isCorrectOption;
                const showIncorrectIndicator = currentQuestionAnswered && isSelected && !isCorrectOption;

                return (
                  <div key={option.id} className="space-y-2">
                    <div
                      className={`p-4 border rounded-lg transition-colors ${
                        currentQuestionAnswered
                          ? isCorrectOption
                            ? "bg-green-50 border-green-200 cursor-not-allowed"
                            : isSelected
                              ? "bg-red-50 border-red-200 cursor-not-allowed"
                              : "bg-background border-border cursor-not-allowed"
                          : isSelected
                            ? "bg-blue-50 border-blue-200 cursor-pointer"
                            : "hover:bg-muted cursor-pointer"
                      }`}
                      onClick={() => currentQuestionAnswered || isSubmitting ? undefined : handleOptionSelect(option.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>{option.text}</div>
                        {showCorrectIndicator && <Check className="h-5 w-5 text-green-500" />}
                        {showIncorrectIndicator && <X className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                    {currentQuestionAnswered && isSelected && (
                      <div
                        className={`p-3 text-sm rounded mt-2 ${
                          isCorrectOption ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                        }`}
                      >
                        {isCorrectOption ? "Correct!" : "Incorrect."}
                        {option.explanation && (
                          <p className="mt-1 text-xs">{option.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            } else {
              return <p className="text-red-500">Error: Question options are missing or invalid.</p>;
            }
          })()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNextQuestion}
          // Disable Next/Finish if the current question isn't answered OR if submitting
          disabled={!isAnswered || isSubmitting}
        >
           {isSubmitting ? (currentQuestionIndex === totalQuestions - 1 ? 'Finishing...' : 'Saving...') : (currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next")}
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}
    </div>
  )
}
