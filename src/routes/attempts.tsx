import React from 'react';
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
} from "@/components/ui/table"; // Keep this import, even if component is missing for now
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
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