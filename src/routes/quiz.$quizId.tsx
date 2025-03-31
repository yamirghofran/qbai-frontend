import { createFileRoute, Outlet } from '@tanstack/react-router';

// Define the layout route for the /quiz/$quizId path segment
// This component just renders an Outlet for its children
export const Route = createFileRoute('/quiz/$quizId')({
  component: QuizLayoutComponent,
  // No loader needed here, children will load their own data
});

function QuizLayoutComponent() {
  return <Outlet />; // Render child routes (index or attempt)
}