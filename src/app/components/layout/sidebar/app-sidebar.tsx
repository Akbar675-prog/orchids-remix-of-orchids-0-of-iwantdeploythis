"use client"

import { groupChatsByDate } from "@/app/components/history/utils"
import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useChats } from "@/lib/chat-store/chats/provider"
import GithubIcon from "@/components/icons/github"
import {
  ChatTeardropText,
  MagnifyingGlass,
  NotePencilIcon,
  X,
  Globe,
  ChatCircleText,
} from "@phosphor-icons/react"
import { Pin, Key, Flag } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { HistoryTrigger } from "../../history/history-trigger"
import { SidebarList } from "./sidebar-list"
import { SidebarProject } from "./sidebar-project"

export function AppSidebar() {
  const isMobile = useBreakpoint(768)
  const { setOpenMobile } = useSidebar()
  const { chats, pinnedChats, isLoading } = useChats()
  const params = useParams<{ chatId: string; channel: string }>()
  const currentChatId = params.chatId

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(chats, "")
    return result
  }, [chats])
  const hasChats = chats.length > 0
  const router = useRouter()

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-border/40 border-r bg-transparent"
    >
      <SidebarHeader className="h-14 pl-3">
        <div className="flex justify-between">
          {isMobile ? (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-md bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <X size={24} />
            </button>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="border-border/40 border-t">
        <ScrollArea className="flex h-full px-3 [&>div>div]:!block">
          <div className="mt-3 mb-5 flex w-full flex-col items-start gap-0">
            <button
              className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
              type="button"
              onClick={() => router.push("/")}
            >
              <div className="flex items-center gap-2">
                <NotePencilIcon size={20} />
                New Chat
              </div>
              <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
                ⌘⇧U
              </div>
            </button>
            <HistoryTrigger
              hasSidebar={false}
              classNameTrigger="bg-transparent hover:bg-accent/80 hover:text-foreground text-primary relative inline-flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors group/search"
              icon={<MagnifyingGlass size={24} className="mr-2" />}
              label={
                <div className="flex w-full items-center gap-2">
                  <span>Search</span>
                  <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/search:opacity-100">
                    ⌘+K
                  </div>
                </div>
              }
              hasPopover={false}
            />
            </div>
            <div className="mb-6 px-2 space-y-1">
              <div className="px-2 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-50">
                Community
              </div>
              <button
                onClick={() => router.push("/Chat/Global")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  params.channel === 'Global' ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe size={18} />
                <span>Global Chat</span>
              </button>
              <button
                onClick={() => router.push("/Chat/ID")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  params.channel === 'ID' ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flag size={18} className="text-red-500" />
                <span>Indonesia</span>
              </button>
              <button
                onClick={() => router.push("/Chat/US")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  params.channel === 'US' ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flag size={18} className="text-blue-500" />
                <span>USA</span>
              </button>
            </div>
            <SidebarProject />

          {isLoading ? (
            <div className="h-full" />
          ) : hasChats ? (
            <div className="space-y-5">
              {pinnedChats.length > 0 && (
                <div className="space-y-5">
                  <SidebarList
                    key="pinned"
                    title="Pinned"
                    icon={<Pin className="size-3" />}
                    items={pinnedChats}
                    currentChatId={currentChatId}
                  />
                </div>
              )}
              {groupedChats?.map((group) => (
                <SidebarList
                  key={group.name}
                  title={group.name}
                  items={group.chats}
                  currentChatId={currentChatId}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center">
              <ChatTeardropText
                size={24}
                className="text-muted-foreground mb-1 opacity-40"
              />
              <div className="text-muted-foreground text-center">
                <p className="mb-1 text-base font-medium">No chats yet</p>
                <p className="text-sm opacity-70">Start a new conversation</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>
          <SidebarFooter className="border-border/40 mb-2 border-t p-3">
                <button
                  onClick={() => router.push("/api-keys")}
                  className="hover:bg-muted flex items-center gap-2 rounded-md p-2 w-full text-left"
                  aria-label="API Keys"
                >
                <div className="rounded-full border p-1">
                  <Key className="size-4" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sidebar-foreground text-sm font-medium">
                    API Keys
                  </div>
                  <div className="text-sidebar-foreground/70 text-xs">
                    Manage your API access
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push("/about")}

              className="hover:bg-muted flex items-center gap-2 rounded-md p-2 w-full text-left"
              aria-label="About Visora"
            >
              <div className="rounded-full border p-1">
                <ChatTeardropText className="size-4" />
              </div>
              <div className="flex flex-col">
                <div className="text-sidebar-foreground text-sm font-medium">
                  About Visora
                </div>
                <div className="text-sidebar-foreground/70 text-xs">
                  Learn more about this project
                </div>
              </div>
            </button>
            <a
              href="https://github.com/swampyrepo"
            className="hover:bg-muted flex items-center gap-2 rounded-md p-2"
            target="_blank"
            aria-label="Star the repo on GitHub"
          >
              <div className="rounded-full border p-1">
                <GithubIcon className="size-4" />
              </div>
            <div className="flex flex-col">
              <div className="text-sidebar-foreground text-sm font-medium">
                Visora is open source
              </div>
              <div className="text-sidebar-foreground/70 text-xs">
                Star the repo on GitHub!
              </div>
            </div>
          </a>
      </SidebarFooter>
    </Sidebar>
  )
}
