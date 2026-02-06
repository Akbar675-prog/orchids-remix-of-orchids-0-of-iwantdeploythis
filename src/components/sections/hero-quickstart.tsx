"use client"

import React, { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { toast } from "@/components/ui/toast";

const HeroQuickstart: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const curlCommand = `curl -X POST https://genapi.visora.my.id/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_VSK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
     "model": "gpt-5.2",
     "messages": [
       { "role": "user", "content": "Halo!" }
     ]
   }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    toast({ title: "Copied to clipboard", status: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-[1024px] mx-auto pt-12 pb-12 px-8">
      {/* Page Title */}
      <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#000000] mb-12">
        Visora Platform
      </h1>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
        {/* Left Column: Text Content */}
        <div className="flex-1 max-w-[420px]">
          <h2 className="text-[18px] font-semibold leading-[1.4] text-[#000000] mb-2">
            Developer quickstart
          </h2>
          <p className="text-[14px] leading-[1.6] text-[#6e6e73] mb-6">
            Make your first API request in minutes. Learn the basics of the Visora platform.
          </p>
          <a
            href="/api-keys"
            className="inline-flex items-center justify-center bg-[#000000] text-[#ffffff] px-4 py-2 rounded-full text-[14px] font-medium transition-opacity hover:opacity-90"
          >
            Get API Key
          </a>
        </div>

        {/* Right Column: Code Sample */}
        <div className="flex-1 min-w-0 md:max-w-[500px] bg-[#f6f8fa] border border-[#e5e5e5] rounded-lg overflow-hidden flex flex-col">
          {/* Code Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#e5e5e5] h-[40px]">
            <div className="flex items-center gap-1 cursor-pointer group">
              <span className="text-[13px] font-normal text-[#6e6e73] group-hover:text-[#000000]">cURL</span>
              <ChevronDown className="w-4 h-4 text-[#6e6e73] group-hover:text-[#000000]" />
            </div>
            <button 
              onClick={handleCopy}
              className="text-[#6e6e73] hover:text-[#000000] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 font-mono text-[13px] leading-[1.5] overflow-x-auto bg-[#f6f8fa]">
            <div className="flex gap-4">
              {/* Code Content */}
              <div className="whitespace-pre text-[#24292e]">
                <div><span className="text-[#cf222e]">curl</span> -X POST https://genapi.visora.my.id/v1/chat/completions \</div>
                <div>  -H <span className="text-[#0a3069]">&quot;Authorization: Bearer YOUR_VSK_KEY&quot;</span> \</div>
                <div>  -H <span className="text-[#0a3069]">&quot;Content-Type: application/json&quot;</span> \</div>
                <div>  -d <span className="text-[#0a3069]">&apos;&#123;</span></div>
                <div><span className="text-[#0a3069]">     &quot;model&quot;: &quot;gpt-5.2&quot;,</span></div>
                <div><span className="text-[#0a3069]">     &quot;messages&quot;: [</span></div>
                <div><span className="text-[#0a3069]">       &#123; &quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;Halo!&quot; &#125;</span></div>
                <div><span className="text-[#0a3069]">     ]</span></div>
                <div><span className="text-[#0a3069]">   &#125;&apos;</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroQuickstart;