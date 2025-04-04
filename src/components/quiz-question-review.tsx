import { useState } from 'react';
// Ensure correct import path for types - adjust if necessary
import { Question, AttemptAnswer, Option } from '@/types'; // Use Question type and import Option type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, XCircle, Info } from "lucide-react";

// Helper function to find user's answer
const findUserAnswer = (attemptAnswers: AttemptAnswer[], questionId: string): AttemptAnswer | undefined => {
  // Added null/undefined check for attemptAnswers
  if (!attemptAnswers || !Array.isArray(attemptAnswers)) {
    return undefined;
  }
  return attemptAnswers.find(ans => ans.question_id === questionId);
};

interface QuizQuestionReviewProps {
  // Use the correct Question type
  questions: Question[] | undefined | null;
  attemptAnswers: AttemptAnswer[] | undefined | null;
}

export function QuizQuestionReview({ questions, attemptAnswers }: QuizQuestionReviewProps) {
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle cases where questions or answers might be null/undefined or empty
  if (!questions || questions.length === 0) {
    return (
       <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
             No questions found for this quiz review.
          </CardContent>
       </Card>
    );
  }

  // Ensure attemptAnswers is an array for mapping, default to empty array if null/undefined
  const currentAttemptAnswers = attemptAnswers || [];

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        // Pass the validated attemptAnswers array
        const userAnswer = findUserAnswer(currentAttemptAnswers, question.id);
        const wasCorrect = userAnswer?.is_correct ?? false;
        const selectedOption = question.options?.find((opt: Option) => opt.id === userAnswer?.selected_answer_id);
        const correctOption = question.options?.find((opt: Option) => opt.is_correct);

        return (
          <Card key={question.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start gap-3">
                {!userAnswer ? (
                   <XCircle className="h-6 w-6 flex-shrink-0 text-gray-400 mt-0.5" />
                ) : !wasCorrect ? (
                  <XCircle className="h-6 w-6 flex-shrink-0 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-grow">
                  <CardTitle className="text-base font-medium leading-tight">
                    {index + 1}. {question.text}
                  </CardTitle>
                  {question.topic_title && (
                    <Badge variant="outline" className="font-normal">
                      {question.topic_title}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pl-12"> {/* Keep content indented */}
              <div className="space-y-3">
                {/* User's Incorrect Answer */}
                {userAnswer && selectedOption && !wasCorrect && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <div className="text-sm text-red-600 dark:text-red-400">{selectedOption.text}</div>
                  </div>
                )}
                 {/* Correct Answer (Show if user was wrong, or if user was right) */}
                 {correctOption && (
                   <div className="flex items-start gap-3">
                     <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
                     <div className="text-sm text-green-600 dark:text-green-400">{correctOption.text}</div>
                   </div>
                 )}
                 {/* If user was correct, we already show the correct answer above. No need for duplication. */}

                {/* Not Answered */}
                {!userAnswer && (
                  <div className="flex items-start gap-3">
                     <XCircle className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                     <div className="text-sm text-muted-foreground italic">Not answered</div>
                  </div>
                )}

                {/* Explanation */}
                {correctOption?.explanation && (
                  <>
                    <Separator className="my-2" />
                    <Collapsible
                      // Use question.id which should be a string or number convertible to string key
                      open={expandedExplanations[question.id] || false}
                      onOpenChange={() => toggleExplanation(question.id)}
                      className="w-full"
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-4 w-4" />
                        {expandedExplanations[question.id] ? "Hide Explanation" : "Show Explanation"}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="text-sm text-muted-foreground bg-muted/10 dark:bg-muted/30 p-3 rounded-md border">
                          {correctOption.explanation}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}