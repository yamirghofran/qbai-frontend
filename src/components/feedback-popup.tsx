import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/api/client" // Import the API client

export default function FeedbackWidget() {
  const [rating, setRating] = useState<number | null>(null)
  const [content, setContent] = useState("") // Renamed from comment
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => { // Make function async
    if (!rating) return // Should not happen due to button disable, but good practice

    try {
      // Send feedback to the backend (baseURL '/api' is already in apiClient)
      await apiClient.post("/feedback", { content, rating })
      console.log("Feedback submitted:", { rating, content })
      setSubmitted(true)

      // Reset form after 2 seconds and close popover
      setTimeout(() => {
        setRating(null)
        setContent("") // Reset content
        setSubmitted(false)
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      // Optionally: Show an error message to the user
      // For now, just log the error and don't close the popover immediately
      // You might want to reset submitted state here too if you show an error
      // setSubmitted(false);
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <p className="text-base m-4 hover:cursor-pointer hover:underline">Leave us feedback</p>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 ml-4" side="top">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-2">
              <h3 className="text-lg font-medium">Thank you!</h3>
              <p className="text-sm text-muted-foreground">Your feedback has been submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Tell us what you think..."
                value={content} // Use content state
                onChange={(e) => setContent(e.target.value)} // Use setContent
                className="min-h-[80px] text-sm w-full"
              />

              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={cn(
                          "h-5 w-5 transition-all",
                          rating && rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                        )}
                      />
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="px-3 py-1 h-8 text-xs"
                  onClick={handleSubmit}
                  disabled={!rating}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

