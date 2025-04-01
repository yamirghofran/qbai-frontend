import { createFileRoute } from '@tanstack/react-router';
// Import the parent route definition
import { Route as parentRoute } from './quiz.$quizId.attempt.$attemptId' // Corrected path
import QuizInterface from '@/components/quiz-interface';

// Define the index route. It implicitly gets the path '/' relative to its parent.
export const Route = createFileRoute('/quiz/$quizId/attempt/$attemptId/')({
  component: QuizAttemptIndexPage,
  // No loader needed here, we use the parent's loader data
});

function QuizAttemptIndexPage() {
  // Use the imported parent route's hook to get its loader data
  const { quiz, attempt } = parentRoute.useLoaderData();
  // Get attemptId from the URL parameters captured by this route or its parents
  const { attemptId } = Route.useParams();

  // Basic check if data is available (though parent loader should handle errors)
  if (!quiz || !attempt) {
    // This might indicate an issue with accessing parent data or the parent loader failed
    return <div>Error: Missing quiz or attempt data for the interface.</div>;
  }

  // Render the actual Quiz Interface using the data
  return (
    // Container div might be redundant if the parent layout already provides it,
    // but keeping it for consistency for now. Adjust if needed.
    <div className="container mx-auto p-4">
      <QuizInterface
        quiz={quiz}
        attempt={attempt}
        attemptId={attemptId}
      />
    </div>
  );
}