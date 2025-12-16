import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  console.log("FeedPage: Rendering with quizzes data:", quizzes);

  // Filter quizzes based on search term
  const filteredQuizzes = useMemo(() => {
    if (!searchTerm.trim()) {
      return quizzes;
    }

    const searchLower = searchTerm.toLowerCase();
    return quizzes.filter((quiz) => {
      return (
        quiz.title.toLowerCase().includes(searchLower) ||
        quiz.description?.toLowerCase().includes(searchLower) ||
        quiz.creator_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [quizzes, searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Feed</h1>
      <p className="text-muted-foreground mb-4">
        Discover quizzes created by the community
      </p>

      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quizzes by title, description, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} found
          </p>
        )}
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No public quizzes available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to create a public quiz!
          </p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No quizzes match your search.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
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
