import { Button } from "@/components/ui/button" // Corrected import path
import { Dialog, DialogContent } from "@/components/ui/dialog" // Corrected import path

// TODO: Consider making this configurable via environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function SignupLoginModal() { // Kept original name for consistency with __root.tsx import
  const handleLogin = () => {
    // Redirect the browser to the backend's Google login endpoint
    window.location.href = `${BACKEND_URL}/login`;
  };

  return (
    // Render the Dialog directly, controlled by the parent component's conditional rendering
    // open={true} because this component is only rendered when it should be visible.
    // Omitting onOpenChange makes it non-dismissible without logging in.
    <Dialog open={true} >
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden border-none" > {/* Increased max-width for larger modal */}
        <div className="grid md:grid-cols-2 md:items-start"> {/* Align items to start */}
          {/* Left side - Video */}
          {/* Left side - Video: Removed fixed height h-[180px] to allow resizing */}
          {/* Video container - Removed bg-black */}
          <div className="w-full hidden md:block border-r border-border"> {/* Hide on small screens */}
            {/* Video dictates size - Added block display */}
            <video src="/qbai-demo.mp4" muted loop autoPlay playsInline className="w-full h-auto block" /> {/* Added block */}
          </div>

          {/* Right side - Content */}
          <div className="p-6 md:p-8 flex flex-col h-full"> {/* Removed justify-between */}
            <div className="space-y-4">
              <div className="space-y-2 text-center md:text-left"> {/* Centered on mobile */}
                <h1 className="text-2xl md:text-3xl font-bold">QuizBuilder AI</h1> {/* Updated App Name */}
                <p className="text-muted-foreground">From slides to quiz in a minute.</p> {/* Updated tagline */}
              </div>

              <p>Upload your slides, notes, lectures, and create a quiz with explanations and feedback.</p>

              {/* Wrapper div with mt-auto to push button to bottom */}
              <div className="mt-auto">
                <Button className="w-full select-none" variant="outline" onClick={handleLogin}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </div>

              {/*<div className="text-center text-xs text-muted-foreground pt-4">
                By signing in, you agree to our{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </a>
                .
              </div>*/}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}