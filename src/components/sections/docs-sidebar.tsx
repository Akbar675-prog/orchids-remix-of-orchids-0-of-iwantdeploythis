"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Key,
  MessageCircle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const sidebarData = [
  {
    title: "Platform",
    items: [
      { name: "API Key", href: "/api-keys", icon: Key },
      { name: "Chat", href: "/", icon: MessageCircle },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 w-full">
           <div className="flex items-center gap-2 px-2 py-1">
             <span className="text-sm font-semibold">Documentation</span>
           </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        {sidebarData.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.name}
                        className="px-4"
                      >
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
