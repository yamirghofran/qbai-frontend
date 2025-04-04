import { createFileRoute, Link } from '@tanstack/react-router';
import quizService from '@/api/quizservice'; // Keep one import
import { Quiz, QuizAttempt, AttemptAnswer } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Gauge from "@/components/ui/gauge";
import { Button } from "@/components/ui/button";
// Remove Check, X, CheckCircle, XCircle, Info as they are in the component now
import { QuizQuestionReview } from '@/components/quiz-question-review'; // Import the new component

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

// Helper function to find user's answer for a question (needed for getTopicPerformance)
const findUserAnswer = (attemptAnswers: AttemptAnswer[] | null | undefined, questionId: string): AttemptAnswer | undefined => {
  // Ensure attemptAnswers is an array before trying to find
  if (!attemptAnswers || !Array.isArray(attemptAnswers)) {
    return undefined;
  }
  return attemptAnswers.find(ans => ans.question_id === questionId);
};

// Remove findUserAnswer helper function - moved to component

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
  // Remove state and toggle function - moved to component

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
          <CardDescription>{attempt.end_time ? new Date(attempt.end_time).toLocaleString() : 'N/A'}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Combined Score Gauge and Topics */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Left Side: Gauge */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Pass scorePercentage as value, showMax optionally displays raw score */}
              {/* Pass correct props: value (percentage), showCounts, correctCount, totalCount */}
              <Gauge value={scorePercentage} max={100} size="md" showCounts={true} correctCount={attempt.score} totalCount={totalQuestions} />
            </div>

            {/* Right Side: Topics to Review */}
            <div className="flex-grow w-full">
              <h3 className="text-lg font-semibold mb-3">Topics to Review</h3>
              {incorrectTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {incorrectTopics.map((topic) => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Great job! No specific topics need review based on this attempt.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removed the separate Topics Recap card as it's now combined with the score */}
      {/* Question & Answer Review - Vertical List */}
      {/* Use the extracted component */}
      <div>
        <QuizQuestionReview questions={quiz.questions} attemptAnswers={attempt.answers} />
      </div>

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
