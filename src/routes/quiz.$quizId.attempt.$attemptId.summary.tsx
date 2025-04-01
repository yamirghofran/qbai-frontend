import { createFileRoute, Link } from '@tanstack/react-router';
import quizService from '@/api/quizservice';
import { Quiz, QuizAttempt, AttemptAnswer } from '@/types'; // Import necessary types
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Progress, Accordion removed
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Import Separator

// Define the route
export const Route = createFileRoute('/quiz/$quizId/attempt/$attemptId/summary')({
  component: QuizAttemptSummaryPage,
  loader: async ({ params }) => {
    try {
      const [quiz, attempt] = await Promise.all([
        quizService.getQuiz(params.quizId),
        quizService.getQuizAttempt(params.attemptId),
      ]);
      // Pre-process or validate data if needed
      if (!quiz || !attempt || attempt.score === null) {
         // Redirect or throw error if attempt isn't finished or data is missing
         // For now, let the component handle missing data display
         console.warn("Quiz or attempt data missing or attempt not finished for summary page.");
      }
      return { quiz, attempt };
    } catch (error) {
      console.error("Loader Error (Summary Page):", error);
      // Consider throwing a specific error or returning a state the component can handle
      throw new Error("Failed to load quiz summary data.");
    }
  },
  // Add pending/error components if desired
  pendingComponent: () => <div className="container mx-auto p-4">Loading summary...</div>,
  errorComponent: ({ error }) => <div className="container mx-auto p-4 text-red-500">Error loading summary: {error.message}</div>,
});

// Helper function to find user's answer for a question
const findUserAnswer = (attemptAnswers: AttemptAnswer[], questionId: string): AttemptAnswer | undefined => {
  // Ensure attemptAnswers is an array before trying to find
  if (!Array.isArray(attemptAnswers)) {
    return undefined;
  }
  return attemptAnswers.find(ans => ans.question_id === questionId);
};

// Helper function to get topic performance
const getTopicPerformance = (quiz: Quiz, attempt: QuizAttempt): Record<string, { correct: number; total: number }> => {
    const performance: Record<string, { correct: number; total: number }> = {};
    if (!quiz?.questions || !Array.isArray(quiz.questions)) return performance; // Guard against missing/invalid questions

    quiz.questions.forEach(q => {
        const topic = q.topic_title || 'General'; // Default topic if none provided
        if (!performance[topic]) {
            performance[topic] = { correct: 0, total: 0 };
        }
        performance[topic].total++;
        const userAnswer = findUserAnswer(attempt.answers, q.id);
        // Check if userAnswer exists and is_correct is true
        if (userAnswer?.is_correct === true) {
            performance[topic].correct++;
        }
    });
    return performance;
};


function QuizAttemptSummaryPage() {
  const { quiz, attempt } = Route.useLoaderData();
  // const params = Route.useParams(); // Get params if needed for links etc.

  if (!quiz || !attempt) {
    return <div className="container mx-auto p-4 text-red-500">Error: Could not load quiz or attempt data for summary.</div>;
  }

  // Attempt might be loaded but not finished yet (score is null)
  if (attempt.score === null) {
     return (
        <div className="container mx-auto p-4 text-center">
            <Card>
                <CardHeader>
                    <CardTitle>{quiz.title} - Attempt In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This quiz attempt has not been finished yet.</p>
                    <p>Complete the quiz to view the summary.</p>
                    <Button variant="outline" asChild className="mt-4">
                        <Link to="/attempts">Back to My Attempts</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
     );
  }

  const totalQuestions = quiz.questions?.length ?? 0; // Handle case where questions might be missing
  const scorePercentage = totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0;
  const topicPerformance = getTopicPerformance(quiz, attempt);
  const incorrectTopics = Object.entries(topicPerformance)
                              .filter(([, stats]) => stats.correct < stats.total)
                              .map(([topic]) => topic);

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{quiz.title} - Summary</CardTitle>
          <CardDescription>Attempt completed on: {attempt.end_time ? new Date(attempt.end_time).toLocaleString() : 'N/A'}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Updated Score Display */}
          <div className="space-y-1">
             <p className="text-2xl font-bold text-center">{scorePercentage}%</p>
             <p className="text-sm text-muted-foreground text-center">{attempt.score} / {totalQuestions} correct</p>
          </div>
        </CardContent>
      </Card>

      {/* Topics Recap - Show only incorrect */}
      <Card>
          <CardHeader>
              <CardTitle>Topics to Review</CardTitle>
          </CardHeader>
          <CardContent>
              {incorrectTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                      {incorrectTopics.map((topic) => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                      ))}
                  </div>
              ) : (
                  <p className="text-muted-foreground">Great job! No specific topics need review based on this attempt.</p>
              )}
          </CardContent>
      </Card>

      {/* Question & Answer Review - Vertical List */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quiz.questions && quiz.questions.length > 0 ? quiz.questions.map((question, index) => {
              const userAnswer = findUserAnswer(attempt.answers, question.id);
              const wasCorrect = userAnswer?.is_correct ?? false;
              const selectedOption = question.options?.find(opt => opt.id === userAnswer?.selected_answer_id);
              const correctOption = question.options?.find(opt => opt.is_correct);

              return (
                <div key={question.id} className="p-4 border rounded-md">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Indicator */}
                    <div className="flex-shrink-0 mt-1">
                       {userAnswer ? (
                           wasCorrect ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />
                       ) : (
                           <span className="h-5 w-5 inline-block text-muted-foreground">-</span> // Placeholder for unanswered
                       )}
                    </div>
                    {/* Question Text & Topic */}
                    <div className="flex-grow">
                       <p className="font-medium">{index + 1}. {question.text}</p>
                       {question.topic_title && <Badge variant="outline" className="mt-1 text-xs">{question.topic_title}</Badge>}
                    </div>
                  </div>

                  {/* Answer Display */}
                  <div className="pl-8 text-sm space-y-2"> {/* Indent answers */}
                     {wasCorrect && correctOption && (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                           <Check className="h-4 w-4 flex-shrink-0" />
                           <span>{correctOption.text}</span>
                           <span className="text-xs text-muted-foreground">(Correct)</span>
                        </div>
                     )}
                     {!wasCorrect && userAnswer && selectedOption && (
                         <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <X className="h-4 w-4 flex-shrink-0" />
                            <span>{selectedOption.text}</span>
                            <span className="text-xs text-muted-foreground">(Your Answer)</span>
                         </div>
                     )}
                     {!wasCorrect && correctOption && (
                         <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Check className="h-4 w-4 flex-shrink-0" />
                            <span>{correctOption.text}</span>
                            <span className="text-xs text-muted-foreground">(Correct Answer)</span>
                         </div>
                     )}
                     {!userAnswer && (
                         <p className="text-muted-foreground italic">Not answered</p>
                     )}
                     {/* Explanation */}
                     {correctOption?.explanation && (
                         <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            <strong>Explanation:</strong> {correctOption.explanation}
                         </div>
                     )}
                  </div>
                   {index < quiz.questions.length - 1 && <Separator className="mt-4" />} {/* Separator between questions */}
                </div>
              );
            }) : (
              <p className="text-muted-foreground p-4 text-center">No questions found for this quiz.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
          <Button variant="outline" asChild>
              <Link to="/attempts">Back to My Attempts</Link>
          </Button>
          {/* Optional: Add a button to retake the quiz? Needs logic to create a *new* attempt */}
          {/* <Button variant="default" className="ml-4" asChild>
               <Link to="/quiz/$quizId" params={{ quizId: quiz.id }}>Take Quiz Again</Link>
          </Button> */}
      </div>
    </div>
  );
}
