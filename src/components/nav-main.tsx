"use client"

import { type LucideIcon } from "lucide-react"
// Removed ChevronRight as it's no longer needed for collapsible

// Removed Collapsible imports
import {
  SidebarGroup,
  // SidebarGroupLabel, // Removed label
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // Removed Sub-menu imports
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean // Keep isActive for potential future styling
    // Removed sub-items definition as it's no longer used
  }[]
}) {
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Menu</SidebarGroupLabel> */} {/* Removed label */}
      <SidebarMenu>
        {items.map((item) => (
          // Removed Collapsible wrapper
          <SidebarMenuItem key={item.title}>
            {/* Pass isActive to potentially style the active link via data attribute */}
            <SidebarMenuButton asChild tooltip={item.title} data-active={item.isActive}>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
            {/* Removed CollapsibleTrigger, Content, and sub-menu logic */}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
