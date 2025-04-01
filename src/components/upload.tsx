import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "@tanstack/react-router"; // Changed import for TanStack Router
import { File, Video, X, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
//import { Input } from "@/components/ui/input";
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
 
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Starting quiz generation...");
    console.log("Media items:", mediaItems);
 
    // Prepare data for quizService.uploadContent
    const files: File[] = mediaItems
      .filter(item => item.sourceType === 'file' && item.file)
      .map(item => item.file as File); // Type assertion as we filtered for item.file
 
    // const youtubeUrls: string[] = mediaItems
    //   .filter(item => item.sourceType === 'video' && item.url)
    //   .map(item => item.url as string); // Type assertion as we filtered for item.url
    //const youtubeUrls: string[] = []; // Keep variable defined but empty for now
 
    console.log("Files to upload:", files.map(f => f.name));
    // console.log("Video URLs:", youtubeUrls); // Commented out logging
 
    // if (files.length === 0 && youtubeUrls.length === 0) { // Original check
    if (files.length === 0) { // Check only for files now
        setError("Please add at least one file."); // Updated error message
        setIsLoading(false);
        return;
    }
 
    try {
      // Call the correct API function with the expected data structure
      // const response = await quizService.uploadContent({ files, youtubeUrls }); // Original call
      const response = await quizService.uploadContent({ files, youtubeUrls: [] }); // Pass empty array for youtubeUrls
      console.log("Quiz generation successful:", response);
      // TODO: Add success notification (e.g., using a toast library)
 
      // Navigate using TanStack Router
      // The path '/quiz/$quizId' should now be recognized
      navigate({ to: '/quiz/$quizId', params: { quizId: response.quizId } });
    } catch (err) {
      console.error("Quiz generation failed:", err);
      // Attempt to parse backend error message if available
      let errorMessage = "An unknown error occurred during quiz generation.";
      // Check if err is an AxiosError or similar structure
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data) {
          const errorData = err.response.data;
          if (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string') {
              errorMessage = errorData.error; // Use backend error message
          } else if (typeof errorData === 'string') {
              errorMessage = errorData; // Use if error is just a string
          }
      } else if (err instanceof Error) {
          errorMessage = err.message; // Fallback to standard error message
      }
      setError(errorMessage);
      // TODO: Add error notification
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
          onClick={handleGenerateQuiz}
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
