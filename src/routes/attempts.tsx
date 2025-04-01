import { createFileRoute, Link } from '@tanstack/react-router'; // Import Link
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Import Button
import quizService from '@/api/quizservice';
import { UserAttempt } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Define the route
export const Route = createFileRoute('/attempts')({
  component: AttemptsPage,
  loader: async () => {
    try {
      console.log("Loader: Fetching user attempts...");
      const attempts = await quizService.listUserAttempts();
      console.log("Loader: Fetched user attempts data:", attempts);
      // Ensure total_questions is treated as a number
      const processedAttempts = attempts.map(attempt => ({
        ...attempt,
        total_questions: Number(attempt.total_questions) || 0, // Ensure it's a number, default to 0 if invalid
      }));
      return { attempts: processedAttempts };
    } catch (error) {
      console.error("Loader: Error fetching user attempts:", error);
      return { attempts: [] as UserAttempt[] };
    }
  },
  pendingComponent: AttemptsLoadingSkeleton,
});

// Define table columns in the desired order: Quiz Name, Score, Date
const columns: ColumnDef<UserAttempt>[] = [
  {
    accessorKey: "quiz_name",
    header: "Quiz Name",
    cell: ({ row }) => {
      // Explicitly cast the value to string
      const quizName = row.getValue("quiz_name") as string;
      const quizId = row.original.quiz_id;
      // const quizName = row.getValue("quiz_name"); // Removed redundant declaration
      return (
        <Link
          to="/quiz/$quizId"
          params={{ quizId }}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {quizName}
        </Link>
      );
    },
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score; // Raw score (number of correct answers)
      const totalQuestions = row.original.total_questions;

      if (score === null || score === undefined) {
        return <div>N/A</div>; // Attempt not finished or scored
      }
      if (totalQuestions === 0) {
        return <div>0%</div>; // Avoid division by zero
      }
      const percentage = Math.round((score / totalQuestions) * 100);
      return <div>{`${percentage}%`}</div>;
    },
  },
  {
    accessorKey: "start_time",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_time"));
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      return <div>{formattedDate}</div>;
    },
  },
  // Add Actions column for View Summary button
  {
    id: "actions",
    header: "Summary",
    cell: ({ row }) => {
      const attempt = row.original; // Get the full UserAttempt object

      // Check if the attempt is finished (score is not null/undefined)
      const isFinished = !(attempt.score === null || attempt.score === undefined);

      if (isFinished) {
        // Show "View Summary" for finished attempts
        return (
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/quiz/$quizId/attempt/$attemptId/summary"
              params={{ quizId: attempt.quiz_id, attemptId: attempt.attempt_id }}
            >
              View Summary
            </Link>
          </Button>
        );
      } else {
        // Show "Continue Attempt" for unfinished attempts
        return (
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/quiz/$quizId/attempt/$attemptId" // Link to the attempt index route
              params={{ quizId: attempt.quiz_id, attemptId: attempt.attempt_id }}
            >
              Continue Attempt
            </Link>
          </Button>
        );
      }
    },
  },
];

// Loading Skeleton Component (Adjusted order)
function AttemptsLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Attempts</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-48" /></TableHead> {/* Quiz Name */}
              <TableHead><Skeleton className="h-5 w-20" /></TableHead> {/* Score */}
              <TableHead><Skeleton className="h-5 w-32" /></TableHead> {/* Date */}
              <TableHead><Skeleton className="h-5 w-32" /></TableHead> {/* Summary */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell> {/* Skeleton for Summary cell */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Main Page Component
function AttemptsPage() {
  const { attempts } = Route.useLoaderData();

  const table = useReactTable({
    data: attempts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log("AttemptsPage: Rendering with attempts data:", attempts);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Attempts</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {/* Update colSpan to include the new actions column */}
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No attempts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}