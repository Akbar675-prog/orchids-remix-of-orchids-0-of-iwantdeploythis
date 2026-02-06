"use client";

import React from "react";
import Link from "next/link";
import { Search, ChevronRight, MessageSquare, BookOpen, UserPlus } from "lucide-react";

const sidebarData = [
  {
    title: "Get started",
    items: [
      { name: "Overview", href: "/docs/overview", active: true },
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "Models", href: "/docs/models" },
      { name: "Pricing", href: "/docs/pricing" },
      { name: "Libraries", href: "/docs/libraries" },
      { name: "Docs MCP", href: "/docs/docs-mcp" },
      { name: "Latest: GPT-5.2", href: "/docs/guides/latest-model" },
    ],
  },
  {
    title: "Core concepts",
    items: [
      { name: "Text generation", href: "/docs/guides/text" },
      { name: "Code generation", href: "/docs/guides/code-generation" },
      { name: "Images and vision", href: "/docs/guides/images-vision" },
      { name: "Audio and speech", href: "/docs/guides/audio" },
      { name: "Structured output", href: "/docs/guides/structured-outputs" },
      { name: "Function calling", href: "/docs/guides/function-calling" },
      { name: "Responses API", href: "/docs/guides/migrate-to-responses" },
    ],
  },
  {
    title: "Agents",
    items: [
      { name: "Overview", href: "/docs/guides/agents" },
      { name: "Build agents", href: "#", hasSubitems: true },
      { name: "Deploy in your product", href: "#", hasSubitems: true },
      { name: "Optimize", href: "#", hasSubitems: true },
      { name: "Voice agents", href: "/docs/guides/voice-agents" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Using tools", href: "/docs/guides/tools" },
      { name: "Connectors and MCP", href: "/docs/guides/tools-connectors-mcp" },
      { name: "Web search", href: "/docs/guides/tools-web-search" },
      { name: "Code interpreter", href: "/docs/guides/tools-code-interpreter" },
      { name: "File search and retrieval", href: "#", hasSubitems: true },
      { name: "More tools", href: "#", hasSubitems: true },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-[calc(60px)] h-[calc(100vh-60px)] w-[260px] bg-[#f9f9f9] border-r border-[#e5e5e5] flex flex-col z-40 overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 py-3">
        <button className="flex items-center justify-between w-full h-[32px] px-2 bg-white border border-[#e5e5e5] rounded-md hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#6e6e73]" />
            <span className="text-[13px] text-[#6e6e73]">Search</span>
          </div>
          <div className="flex items-center gap-0.5">
            <kbd className="text-[10px] font-sans text-[#6e6e73] px-1 bg-gray-50 border border-[#e5e5e5] rounded leading-none flex items-center h-4">
              ⌘
            </kbd>
            <kbd className="text-[10px] font-sans text-[#6e6e73] px-1 bg-gray-50 border border-[#e5e5e5] rounded leading-none flex items-center h-4">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <nav className="flex flex-col gap-6 py-2">
          {sidebarData.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <h3 className="text-[12px] font-semibold text-black uppercase tracking-tight py-1 px-3">
                {section.title}
              </h3>
              <div className="flex flex-col">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                      item.active
                        ? "bg-[#f2f2f2] text-black font-medium"
                        : "text-[#6e6e73] hover:bg-[#f2f2f2] hover:text-black"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.hasSubitems && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#6e6e73]/60" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Links */}
      <div className="mt-auto p-4 border-t border-[#e5e5e5] bg-[#f9f9f9]">
        <div className="flex flex-col gap-1">
          <a
            href="https://cookbook.openai.com"
            className="flex items-center gap-3 px-3 py-2 text-[13px] text-[#6e6e73] hover:bg-[#f2f2f2] hover:text-black rounded-md transition-colors group"
          >
            <BookOpen className="w-4 h-4 text-[#6e6e73] transition-colors group-hover:text-black" />
            <span className="font-normal">Cookbook</span>
          </a>
          <a
            href="https://community.openai.com"
            className="flex items-center gap-3 px-3 py-2 text-[13px] text-[#6e6e73] hover:bg-[#f2f2f2] hover:text-black rounded-md transition-colors group"
          >
            <MessageSquare className="w-4 h-4 text-[#6e6e73] transition-colors group-hover:text-black" />
            <span className="font-normal">Forum</span>
          </a>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .custom-scrollbar:hover::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}