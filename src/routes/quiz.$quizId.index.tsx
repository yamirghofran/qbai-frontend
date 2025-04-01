import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react'; // Added useEffect for potential cleanup if needed, though setTimeout is simple
import quizService from '@/api/quizservice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added Avatar imports
import { ClipboardCopy, Check } from 'lucide-react'; // Added icon imports

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
  const [isCopied, setIsCopied] = useState(false); // State for copy feedback

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

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      // Optionally show an error message to the user
    });
  };

  // Helper to get initials from name for Avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2) // Max 2 initials
      .join('')
      .toUpperCase();
  };

  // Render the Quiz Overview (without Outlet)
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">{quiz.title}</CardTitle>
          {/* Creator Info */}
          {quiz.creator_name && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={quiz.creator_picture ?? undefined} alt={quiz.creator_name} />
                <AvatarFallback>{getInitials(quiz.creator_name)}</AvatarFallback>
              </Avatar>
              <span>{quiz.creator_name}</span>
            </div>
          )}
          {/* End Creator Info */}
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Number of Questions: {quiz.questions?.length ?? 0}</p>
          {/* Button Row */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
            <Button
              onClick={handleAttemptQuiz}
              disabled={isCreatingAttempt}
              className="flex-grow" // Takes available space
            >
              {isCreatingAttempt ? "Starting Quiz..." : "Start Attempt"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex-shrink-0 flex items-center space-x-1" // Prevents shrinking, adds icon spacing
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
          {/* End Button Row */}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
      {/* Outlet removed */}
    </div>
  );
}