import * as React from "react"
import {
  BookOpen,
  Bot, // Keep for potential future use if needed, but remove from nav
  Command, // Keep for potential future use if needed, but remove from nav
  Frame, // Keep for potential future use if needed, but remove from nav
  LifeBuoy, // Keep for potential future use if needed, but remove from nav
  Map, // Keep for potential future use if needed, but remove from nav
  PieChart, // Keep for potential future use if needed, but remove from nav
  Send, // Keep for potential future use if needed, but remove from nav
  Settings2, // Keep for potential future use if needed, but remove from nav
  SquareTerminal, // Keep for potential future use if needed, but remove from nav
  ListChecks,
  PlusCircle, // Added icon for Create Quiz
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary" // Remove if unused
import { NavUser } from "@/components/nav-user"
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
