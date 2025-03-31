import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useAuthStatus } from '@/hooks/useAuthStatus';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/app-sidebar';
import { SignupLoginModal } from '@/components/signup-login-modal'; // Import the modal
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Assuming UserProfile is defined in '@/types/index.ts' or similar
// If not, ensure it's defined there or uncomment/re-add the definition if needed.

export const Route = createRootRoute({
  component: RootComponent, // Use a separate component function
});

function RootComponent() {
  // Use the hook to get auth status
  const { data: authStatus, isLoading, isError } = useAuthStatus();

  // Determine authentication state based on hook results
  // Treat errors as not authenticated for safety
  const isAuthenticated = authStatus?.authenticated === true && !isError;

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        {/* You might want a more sophisticated loading skeleton matching your layout */}
        <div className="w-64 border-r p-4 space-y-4">
           <Skeleton className="h-8 w-3/4" />
           <Skeleton className="h-6 w-full" />
           <Skeleton className="h-6 w-5/6" />
        </div>
        <div className="flex-1 p-4 space-y-4">
           <Skeleton className="h-16 w-full" />
           <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  // Main layout rendering
  console.log("RootComponent: Rendering main content, isAuthenticated:", isAuthenticated); // Log before returning main layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <main className="p-4">
          {isAuthenticated ? (
            <Outlet /> // Render the main app content if authenticated
          ) : (
            <SignupLoginModal /> // Show login modal if not authenticated (or error/loading)
          )}
        </main>
        {/* Optionally hide DevTools if not authenticated or based on environment */}
        {/*<TanStackRouterDevtools />*/}
      </SidebarInset>
    </SidebarProvider>
  );
}