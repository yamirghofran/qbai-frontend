import { createFileRoute } from '@tanstack/react-router';
import quizService from '@/api/quizservice';
import QuizInterface from '@/components/quiz-interface';

// Define the route using dot notation convention
// The path argument should match the file structure relative to the root
export const Route = createFileRoute('/quiz/$quizId/attempt/$attemptId')({
  component: QuizAttemptPage,
  loader: async ({ params }) => {
    // Loader logic remains the same, params are inferred from the full path
    try {
      const [quiz, attempt] = await Promise.all([
        quizService.getQuiz(params.quizId),
        quizService.getQuizAttempt(params.attemptId),
      ]);
      // console.log("Loader (Dot Notation): Fetched quiz data:", quiz); // Removed log
      // console.log("Loader (Dot Notation): Fetched attempt data:", attempt); // Removed log
      return { quiz, attempt };
    } catch (error) {
      // console.error("Loader Error (Dot Notation):", error); // Removed log
      throw new Error("Failed to load quiz or attempt data.");
    }
  },
  // Explicitly add a pending component
  pendingComponent: () => <div>Loading attempt...</div>,
});

function QuizAttemptPage() {
  const { quiz, attempt } = Route.useLoaderData();
  const { attemptId } = Route.useParams();

  // console.log("QuizAttemptPage (Dot Notation): Rendering with quiz:", quiz); // Removed log
  // console.log("QuizAttemptPage (Dot Notation): Rendering with attempt:", attempt); // Removed log
  // console.log("QuizAttemptPage (Dot Notation): attemptId from useParams:", attemptId); // Removed log

  if (!quiz || !attempt) {
    return <div>Error: Quiz or Attempt data is missing.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <QuizInterface
        quiz={quiz}
        attempt={attempt}
        attemptId={attemptId}
      />
    </div>
  );
}