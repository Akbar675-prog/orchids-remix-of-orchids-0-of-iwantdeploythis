"use client"

import { Header } from "@/app/components/layout/header"
import { AppSidebar } from "@/app/components/layout/sidebar/app-sidebar"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { NotificationListener } from "./notification-listener"

export function LayoutApp({ children, hideHeader = false }: { children: React.ReactNode, hideHeader?: boolean }) {
  const { preferences } = useUserPreferences()
  const hasSidebar = preferences.layout === "sidebar"

  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      <NotificationListener />
      {hasSidebar && <AppSidebar />}
      <main className="@container relative h-dvh w-0 flex-shrink flex-grow overflow-y-auto">
        {!hideHeader && <Header hasSidebar={hasSidebar} />}
        {children}
      </main>
    </div>
  )
}
