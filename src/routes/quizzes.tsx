import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'; // Import useRouter
import quizService from '@/api/quizservice';
import { QuizListItem } from '@/types'; // Import the type
import { Trash2 } from 'lucide-react'; // Import Trash icon
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Button } from '@/components/ui/button'; // Import Button
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

// Define the route
export const Route = createFileRoute('/quizzes')({
  component: QuizzesPage,
  loader: async () => {
    try {
      console.log("Loader: Fetching user quizzes...");
      const quizzes = await quizService.listUserQuizzes();
      console.log("Loader: Fetched user quizzes data:", quizzes);
      return { quizzes };
    } catch (error) {
      console.error("Loader: Error fetching user quizzes:", error);
      // Handle error appropriately, maybe return an error state or empty array
      // For now, returning empty array to avoid crashing the component
      // A better approach might involve throwing the error and using an ErrorComponent
      return { quizzes: [] as QuizListItem[] }; 
    }
  },
  // Optional: Add PendingComponent for a better loading experience
  pendingComponent: QuizzesLoadingSkeleton,
  // Optional: Add ErrorComponent for better error handling
  // errorComponent: QuizzesErrorComponent, 
});

// Loading Skeleton Component
function QuizzesLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Page Component
function QuizzesPage() {
  const { quizzes: initialQuizzes } = Route.useLoaderData();
  const [currentQuizzes, setCurrentQuizzes] = useState<QuizListItem[]>(initialQuizzes);
  const [quizToDelete, setQuizToDelete] = useState<QuizListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // State for loading indicator
  const router = useRouter(); // Get router instance for potential refresh

  // Update local state if loader data changes (e.g., after navigation)
  useEffect(() => {
    setCurrentQuizzes(initialQuizzes);
  }, [initialQuizzes]);

  const handleDeleteClick = (quiz: QuizListItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card link navigation
    event.preventDefault(); // Prevent default link behavior
    setQuizToDelete(quiz);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    setIsDeleting(true);
    try {
      console.log(`Attempting to delete quiz: ${quizToDelete.id}`);
      await quizService.deleteQuiz(quizToDelete.id);
      console.log(`Successfully deleted quiz: ${quizToDelete.id}`);
      // Update the state to remove the deleted quiz from the list
      setCurrentQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizToDelete.id));
      setQuizToDelete(null); // Close dialog implicitly by resetting the target
      // Optionally, show a success toast message here
    } catch (error) {
      console.error(`Error deleting quiz ${quizToDelete.id}:`, error);
      // Optionally, show an error toast message here
      setQuizToDelete(null); // Still close dialog on error
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("QuizzesPage: Rendering with quizzes data:", currentQuizzes);

  return (
    <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>
        {currentQuizzes.length === 0 ? (
          <p>You haven't created any quizzes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col relative">
                 {/* Make CardHeader clickable for navigation, but exclude button */}
                 <Link to="/quiz/$quizId" params={{ quizId: quiz.id }} className="absolute inset-0 z-0" aria-label={`View quiz ${quiz.title}`}></Link>
                 <CardHeader className="flex flex-row justify-between items-start z-10 relative">
                   <div className="flex-1 mr-2"> {/* Container for title/desc */}
                     <CardTitle className="mb-1">{quiz.title}</CardTitle>
                     <CardDescription>
                       Created: {new Date(quiz.created_at).toLocaleDateString()}
                     </CardDescription>
                   </div>
                   {/* Delete Button Trigger */}
                   <AlertDialogTrigger asChild>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                       onClick={(e) => handleDeleteClick(quiz, e)}
                       aria-label={`Delete quiz ${quiz.title}`}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </AlertDialogTrigger>
                 </CardHeader>
                 <CardContent className="flex-grow z-10 relative">
                   <p className="text-sm text-muted-foreground">Click card to view or take the quiz.</p>
                 </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alert Dialog Content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the quiz
            titled "{quizToDelete?.title}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Optional Error Component (Example)
// function QuizzesErrorComponent({ error }: { error: Error }) {
//   return (
//     <div className="container mx-auto p-4 text-red-600">
//       <h1 className="text-2xl font-bold mb-4">Error Loading Quizzes</h1>
//       <p>Something went wrong:</p>
//       <pre>{error.message}</pre>
//     </div>
//   );
// }