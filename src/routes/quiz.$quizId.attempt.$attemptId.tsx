import { createFileRoute, Outlet } from '@tanstack/react-router'; // Import Outlet
import quizService from '@/api/quizservice';
// QuizInterface is no longer rendered directly here

// Define the route using dot notation convention
// The path argument should match the file structure relative to the root

// This component now acts as a layout route and renders the child route (e.g., summary)
function QuizAttemptLayout() {
  // The loader data is implicitly passed down to children via Outlet context
  // We don't need to explicitly use useLoaderData or useParams here unless
  // this layout component itself needs them for rendering layout elements.
  return <Outlet />;
}

// Update the component reference in the route definition
export const Route = createFileRoute('/quiz/$quizId/attempt/$attemptId')({
  component: QuizAttemptLayout, // Use the new layout component
  loader: async ({ params }) => {
    // Loader logic remains the same
    try {
      const [quiz, attempt] = await Promise.all([
        quizService.getQuiz(params.quizId),
        quizService.getQuizAttempt(params.attemptId),
      ]);
      return { quiz, attempt };
    } catch (error) {
      throw new Error("Failed to load quiz or attempt data.");
    }
  },
  pendingComponent: () => <div>Loading attempt...</div>,
});