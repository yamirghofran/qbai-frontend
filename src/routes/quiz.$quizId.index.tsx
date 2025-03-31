import { createFileRoute, useNavigate } from '@tanstack/react-router'; // Removed Outlet import
import React, { useState } from 'react';
import { Quiz } from '@/types';
import quizService from '@/api/quizservice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define the route for the specific quiz index page
export const Route = createFileRoute('/quiz/$quizId/')({ // Path indicates index route
  component: QuizIndexPage, // Renamed component function
  loader: async ({ params }) => {
    // Loader remains the same to fetch quiz details for this page
    console.log(`Loader (Index): Fetching quiz with ID: ${params.quizId}`);
    const quiz = await quizService.getQuiz(params.quizId);
    console.log("Loader (Index): Fetched quiz data:", quiz);
    return { quiz };
  }
});

function QuizIndexPage() { // Renamed component function
  const { quiz } = Route.useLoaderData();
  const navigate = useNavigate();
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("QuizIndexPage: Rendering with quiz data:", quiz);

  if (!quiz) {
    return <div>Quiz data not available.</div>;
  }

  const handleAttemptQuiz = async () => {
    setIsCreatingAttempt(true);
    setError(null);
    try {
      console.log(`Attempting to create attempt for quiz ID: ${quiz.id}`);
      const response = await quizService.createQuizAttempt(quiz.id);
      const attemptId = response.attemptId;
      console.log(`Created attempt with ID: ${attemptId}`);
      // Navigate to the attempt route (sibling route now)
      navigate({
        to: '/quiz/$quizId/attempt/$attemptId', // Path remains the same logically
        params: { quizId: quiz.id, attemptId: attemptId },
      });
    } catch (err) {
      console.error("Failed to create quiz attempt or navigate:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while starting the quiz.");
      setIsCreatingAttempt(false);
    }
  };

  // Render the Quiz Overview (without Outlet)
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Number of Questions: {quiz.questions?.length ?? 0}</p>
          <Button
            onClick={handleAttemptQuiz}
            disabled={isCreatingAttempt}
            className="w-full"
          >
            {isCreatingAttempt ? "Starting Quiz..." : "Attempt Quiz"}
          </Button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
      {/* Outlet removed */}
    </div>
  );
}