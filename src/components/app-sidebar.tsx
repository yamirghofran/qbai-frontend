import * as React from "react"
import {
  BookOpen,
  ListChecks,
  PlusCircle, // Added icon for Create Quiz
  Rss, // Added icon for Quiz Feed
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary" // Remove if unused
import { NavUser } from "@/components/nav-user"
import FeedbackWidget from "@/components/feedback-popup" // Import the FeedbackWidget
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Simplified navigation data reflecting core features
const navData = {
  main: [
    {
      title: "Create Quiz",
      url: "/",
      icon: PlusCircle,
      isActive: false, // Router will handle active state based on URL
      items: [],
    },
    {
      title: "Quiz Feed",
      url: "/feed",
      icon: Rss,
      isActive: false,
      items: [],
    },
    {
      title: "My Quizzes",
      url: "/quizzes",
      icon: BookOpen,
      isActive: false,
      items: [],
    },
    {
      title: "My Attempts",
      url: "/attempts",
      icon: ListChecks,
      isActive: false,
      items: [],
    },
    // Removed Playground, Models, Settings
  ],
  // Removed secondary navigation as Feedback was the only item and unused
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {/* Use div for structure, anchor for link */}
              <div>
                <a href="/" className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">QuizBuilderAI</span>
                </a>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass the simplified main navigation data */}
        <NavMain items={navData.main} />
        {/* Removed NavSecondary as it's now empty */}
        {/* mt-auto is handled by flex layout in SidebarContent potentially, or add spacer if needed */}
      </SidebarContent>
      <SidebarFooter>
        <FeedbackWidget /> {/* Add the FeedbackWidget here */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
