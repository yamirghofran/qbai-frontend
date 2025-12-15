import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "@tanstack/react-router"; // Changed import for TanStack Router
import { File, Video, X, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import quizService from "@/api/quizservice"; // Corrected import: default export

// Unified type for both files and videos
type MediaItem = {
  id: string;
  sourceType: "file" | "video";
  name: string; // Used for file name or video title
  // File specific
  file?: File; // Added to hold the actual File object
  type?: string;
  size?: number;
  // Video specific
  url?: string;
};

// Reusable component for displaying a media item
function MediaItemCard({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: (id: string) => void;
}) {
  const isFile = item.sourceType === "file";
  const Icon = isFile ? File : Video;
  const title = item.name;
  const subtitle = isFile
    ? `${(item.size! / 1024).toFixed(1)} KB`
    : item.url;

  return (
    // Make card wider and less tall
    <Card key={item.id} className="overflow-hidden w-full">
      <CardContent className="flex items-center gap-3 relative p-2"> {/* Increased gap, adjusted padding */}
        <Icon className="size-5 flex-shrink-0 text-gray-500" />
        <div className="flex-1 min-w-0 pr-8"> {/* Increased padding-right for button */}
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          // Position button within padding
          className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
          aria-label={`Remove ${isFile ? 'file' : 'video'}`}
        >
          <X className="h-4 w-4" /> {/* Slightly larger icon */}
        </button>
      </CardContent>
    </Card>
  );
}

export default function MediaUploader() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]); // Unified state
  // const [videoUrl, setVideoUrl] = useState(""); // Commented out as YouTube upload is hidden
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate(); // Removed 'from' option for now

  // Dialog state
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);

  // Customization options state
  const [maxQuestions, setMaxQuestions] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme' | undefined>(undefined);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: MediaItem[] = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(),
        sourceType: "file",
        name: file.name,
        type: file.type,
        size: file.size,
        file: file, // Store the File object
      }));
      setMediaItems((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files) {
      const newFiles: MediaItem[] = Array.from(e.dataTransfer.files).map(
        (file) => ({
          id: crypto.randomUUID(),
          sourceType: "file",
          name: file.name,
          type: file.type,
          size: file.size,
          file: file, // Store the File object
        }),
      );
      setMediaItems((prev) => [...prev, ...newFiles]);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  // const handleAddVideo = () => {
  //   if (videoUrl.trim() === "") return;
  //
  //   // Basic title extraction (can be improved)
  //   let title = "YouTube Video";
  //   try {
  //       const urlObj = new URL(videoUrl);
  //       if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
  //           title = `YouTube Video (${urlObj.searchParams.get("v")})`;
  //       } else if (urlObj.hostname.includes("youtu.be")) {
  //           title = `YouTube Video (${urlObj.pathname.slice(1)})`;
  //       }
  //   } catch (error) {
  //       console.error("Invalid URL:", error);
  //       // Keep default title or handle error appropriately
  //   }
  //
  //
  //   const newVideo: MediaItem = {
  //     id: crypto.randomUUID(),
  //     sourceType: "video",
  //     name: title,
  //     url: videoUrl,
  //   };
  //
  //   setMediaItems((prev) => [...prev, newVideo]);
  //   setVideoUrl("");
  // }; // Commented out as YouTube upload is hidden

  // Unified remove handler
  const handleRemoveItem = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };
 
  // This opens the customization dialog
  const handleOpenCustomization = () => {
    if (mediaItems.length === 0) {
      setError("Please add at least one file.");
      return;
    }
    setShowCustomizationDialog(true);
  };

  // This actually submits the quiz generation request
  const handleSubmitQuizGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setShowCustomizationDialog(false); // Close dialog
    console.log("Starting quiz generation...");
    console.log("Media items:", mediaItems);
    console.log("Customization options:", { maxQuestions, difficulty, customPrompt });
 
    // Prepare data for quizService.uploadContent
    const files: File[] = mediaItems
      .filter(item => item.sourceType === 'file' && item.file)
      .map(item => item.file as File); // Type assertion as we filtered for item.file
 
    console.log("Files to upload:", files.map(f => f.name));
 
    if (files.length === 0) { // Check only for files now
        setError("Please add at least one file."); // Updated error message
        setIsLoading(false);
        return;
    }
 
    try {
      // Call the API with optional customization parameters
      const response = await quizService.uploadContent({ 
        files, 
        youtubeUrls: [],
        maxQuestions,
        difficulty,
        customPrompt: customPrompt.trim() || undefined,
      });
      console.log("Quiz generation successful:", response);
 
      // Navigate using TanStack Router
      navigate({ to: '/quiz/$quizId', params: { quizId: response.quizId } });
    } catch {
      // Display generic error message to avoid exposing sensitive information
      setError("Oops, there was an error generating your quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Changed from grid to flex for centering the single upload component */}
      <div className="flex justify-center">
        {/* Files Upload Section */}
        <div className="space-y-4">
          {/*<h2 className="text-2xl font-semibold">Files</h2>*/}
          <div
            className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 h-[280px] w-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <File className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium">Drag and drop your files here</p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, TXT, MD, or DOCX files (max 10MB each)
              </p>
            </div>
            <Button variant="secondary" onClick={handleBrowseFiles} className="mt-2">
              Browse Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.txt,.md,.docx"
            />
          </div>
          {/* Files list removed from here */}
        </div>

        {/* --- YouTube Videos Section (Temporarily Hidden) --- */}
        {/*
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">YouTube Videos</h2>
          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 h-[280px] w-full">
            <Video className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium">Add YouTube video URLs</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter video URLs to generate questions from their transcripts
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2 mt-2">
              <Input
                placeholder="Paste YouTube URL here"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddVideo();
                }}
              />
              <Button onClick={handleAddVideo}>Add URL</Button>
            </div>
          </div>
        </div>
        */}
      </div>

      {/* Generate Button */}
      <div className="mt-12 flex justify-center">
        <Button
          size="lg"
          disabled={mediaItems.length === 0 || isLoading}
          onClick={handleOpenCustomization}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </div>

      {/* Quiz Customization Dialog */}
      <Dialog open={showCustomizationDialog} onOpenChange={setShowCustomizationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customize Your Quiz</DialogTitle>
            <DialogDescription>
              Optionally configure your quiz generation settings. Leave fields empty to use defaults.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Max Questions */}
            <div className="space-y-2">
              <Label htmlFor="max-questions">Maximum Questions</Label>
              <Input
                id="max-questions"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 10 (leave empty for default)"
                value={maxQuestions ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setMaxQuestions(value ? parseInt(value, 10) : undefined);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Limit the number of questions generated
              </p>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={difficulty ?? ''}
                onValueChange={(value) => {
                  setDifficulty(value ? value as 'easy' | 'medium' | 'hard' | 'extreme' : undefined);
                }}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the difficulty level for questions
              </p>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Instructions</Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., Focus on practical applications, include code examples..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide specific instructions for quiz generation
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCustomizationDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitQuizGeneration}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <p className="mt-4 text-center text-red-600">{error}</p>
      )}

      {/* Combined Media List - Moved Below Generate Button */}
      {mediaItems.length > 0 && (
        <div className="mt-8 space-y-4 max-w-3xl mx-auto"> {/* Center and constrain width */}
          <h3 className="text-xl font-semibold text-center">Added Media</h3> {/* Centered heading */}
          <div className="space-y-2"> {/* Vertical list with spacing */}
            {mediaItems.map((item) => (
              <MediaItemCard key={item.id} item={item} onRemove={handleRemoveItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
