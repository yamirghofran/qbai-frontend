import { createFileRoute, Link } from '@tanstack/react-router';
import quizService from '@/api/quizservice';
import { PublicQuizFeedItem } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';

// Define the route
export const Route = createFileRoute('/feed')({
  component: FeedPage,
  loader: async () => {
    try {
      console.log("Loader: Fetching public quizzes for feed...");
      const quizzes = await quizService.listPublicQuizzes();
      console.log("Loader: Fetched public quizzes data:", quizzes);
      return { quizzes };
    } catch (error) {
      console.error("Loader: Error fetching public quizzes:", error);
      return { quizzes: [] as PublicQuizFeedItem[] };
    }
  },
  pendingComponent: FeedLoadingSkeleton,
});

// Loading Skeleton Component
function FeedLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Feed Page Component
function FeedPage() {
  const { quizzes } = Route.useLoaderData();

  console.log("FeedPage: Rendering with quizzes data:", quizzes);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Feed</h1>
      <p className="text-muted-foreground mb-6">
        Discover quizzes created by the community
      </p>
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No public quizzes available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to create a public quiz!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to="/quiz/$quizId"
              params={{ quizId: quiz.id }}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="line-clamp-3">
                      {quiz.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={quiz.creator_picture || undefined} 
                        alt={quiz.creator_name || 'User'}
                      />
                      <AvatarFallback>
                        {quiz.creator_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">
                      {quiz.creator_name || 'Anonymous'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(quiz.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
