// Force rebuild 2026-01-30 v2
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatsProvider } from "@/lib/chat-store/chats/provider"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { ChatSessionProvider } from "@/lib/chat-store/session/provider"
import { ModelProvider } from "@/lib/model-store/provider"
import { TanstackQueryProvider } from "@/lib/tanstack-query/tanstack-query-provider"
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider"
import { UserProvider } from "@/lib/user-store/provider"
import { getUserProfile } from "@/lib/user/api"
import { ThemeProvider } from "next-themes"
import Script from "next/script"
import { LayoutClient } from "./layout-client"
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import { WelcomePopup } from "@/app/components/layout/welcome-popup"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Visora AI — Futuristic AI Labs Platform",
  description:
    "Visora AI adalah platform AI Labs modern untuk API, tools, dan inovasi teknologi.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Visora AI — Futuristic AI Labs Platform",
    description: "Visora AI adalah platform AI Labs modern untuk API, tools, dan inovasi teknologi.",
    images: [
      {
        url: "/favicon.ico",
        width: 800,
        height: 800,
        alt: "Visora AI Logo",
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userProfile = await getUserProfile()
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="c97e889f-a0b8-4b7c-930a-78d93801bd74"
        />
        <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          <Script
            src="https://js.puter.com/v2/"
            strategy="beforeInteractive"
          />
          <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={userProfile}>
            <ModelProvider>
                <ChatsProvider userId={userProfile?.id}>
                  <ChatSessionProvider>
                    <MessagesProvider>
                      <UserPreferencesProvider
                        userId={userProfile?.id}
                        initialPreferences={userProfile?.preferences}
                      >
                        <TooltipProvider
                          delayDuration={200}
                          skipDelayDuration={500}
                        >
                          <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                            disableTransitionOnChange
                          >
                            <SidebarProvider defaultOpen>
                              <Toaster position="top-center" />
                              <WelcomePopup />
                              {children}
                            </SidebarProvider>
                          </ThemeProvider>
                        </TooltipProvider>
                      </UserPreferencesProvider>
                    </MessagesProvider>
                  </ChatSessionProvider>
                </ChatsProvider>
            </ModelProvider>
          </UserProvider>
        </TanstackQueryProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
