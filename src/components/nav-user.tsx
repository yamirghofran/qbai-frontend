import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import mutation hooks
import { useAuthStatus } from "@/hooks/useAuthStatus"; // Import the hook
import { logoutUser } from "@/api/authService"; // Import the logout API function
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Remove the user prop
export function NavUser() {
  // const { isMobile } = useSidebar(); // Removed duplicate call
  const { data: authStatus, isLoading, isError } = useAuthStatus(); // Use the auth status hook
  const queryClient = useQueryClient(); // Get query client instance

  // Setup the mutation for logging out
  const logoutMutation = useMutation({
    mutationFn: logoutUser, // The function to call for logging out
    onSuccess: () => {
      // Invalidate the auth status query to refetch and update UI
      queryClient.invalidateQueries({ queryKey: ['authStatus'] });
      // Optional: Force a reload or redirect to ensure clean state,
      // though invalidation should handle UI updates.
      // window.location.reload();
      // Or navigate using your router if needed: router.navigate({ to: '/' });
      console.log("Logout successful, authStatus invalidated.");
    },
    onError: (error) => {
      // Handle logout error (e.g., show a notification)
      console.error("Logout failed:", error);
      // Maybe show an error message to the user
    },
  });

  // --- Loading State ---
  // Add check for mutation loading state if desired (e.g., disable button)
  const isLoggingOut = logoutMutation.isPending;
// }; <-- Removed erroneous closing brace here

  // --- Loading State ---
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex h-[52px] items-center gap-2 p-2"> {/* Match button size */}
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // --- Unauthenticated or Error State ---
  if (isError || !authStatus?.authenticated || !authStatus.user) {
    // Render nothing in the sidebar footer if not logged in/error
    return null;
  }

  // --- Authenticated State ---
  const user = authStatus.user; // Get user data from the hook
  const { isMobile } = useSidebar(); // Keep this one

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-full">
                <AvatarImage src={user.picture} alt={user.name} />
                {/* Fallback with initials from name */}
                <AvatarFallback className="rounded-lg">
                  {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                 {/* Use dynamic name */}
                <span className="truncate font-semibold">{user.name}</span>
                 {/* Use dynamic email */}
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                   {/* <AvatarImage src={user.picture} alt={user.name} /> Removed: picture not in type */}
                   {/* Fallback with initials from name */}
                  <AvatarFallback className="rounded-lg">
                    {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                   {/* Use dynamic name */}
                  <span className="truncate font-semibold">{user.name}</span>
                   {/* Use dynamic email */}
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Trigger the mutation on click, disable while pending */}
            <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={isLoggingOut}>
              <LogOut className={isLoggingOut ? "animate-spin" : ""} /> {/* Optional: Add loading indicator */}
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
