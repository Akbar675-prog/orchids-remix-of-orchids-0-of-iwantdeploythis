"use client"

import { Header } from "@/app/components/layout/header"
import { DocsSidebar } from "@/components/sections/docs-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="bg-background flex h-svh w-full overflow-hidden">
        <DocsSidebar />
        <SidebarInset className="relative flex flex-col min-h-svh w-full overflow-y-auto">
          <Header hasSidebar={true} />
          <main className="flex-1 pt-14">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
