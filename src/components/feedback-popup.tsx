import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FeedbackWidget() {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // Here you would typically send the feedback to your backend
    console.log({ rating, comment })
    setSubmitted(true)

    // Reset form after 2 seconds and close popover
    setTimeout(() => {
      setRating(null)
      setComment("")
      setSubmitted(false)
      setIsOpen(false)
    }, 2000)
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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

