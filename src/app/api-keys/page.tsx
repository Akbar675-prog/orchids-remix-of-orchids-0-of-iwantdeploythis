"use client"

import { useEffect, useState } from "react"
import { LayoutApp } from "@/app/components/layout/layout-app"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft,
  FileText, 
  Sparkle, 
  Trash,
  Copy,
  Check,
  Calendar,
  Clock,
  Terminal,
  Key
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ButtonCopy } from "@/components/common/button-copy"
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockGroup,
} from "@/components/prompt-kit/code-block"

interface AppApiKey {
  id: string
  key: string
  name: string
  created_at: string
  last_used_at: string | null
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<AppApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<AppApiKey | null>(null)
  const [showBanner, setShowBanner] = useState(true)

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/app-keys")
      const data = await res.json()
      if (res.ok) {
        setKeys(data)
      } else {
        toast.error(data.error || "Gagal memuat API Key")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memuat API Key")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  useEffect(() => {
    const dismissed = sessionStorage.getItem("opus-46-toast-dismissed")
    if (dismissed) return

    const timer = setTimeout(() => {
      toast.custom(
        (t) => (
          <div
            className="w-[420px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
            style={{ pointerEvents: "auto" }}
          >
            <div className="relative w-full h-[180px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://exafunction.github.io/public/images/blog/opus-4.6/opus-4.6-blog-card.png"
                alt="Claude Opus 4.6"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <h3
                className="text-base font-semibold text-foreground"
                dangerouslySetInnerHTML={{
                  __html: "New Models - <strong>Claude Opus 4.6</strong>",
                }}
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Claude Opus 4.6 is Anthropic&apos;s most powerful model yet, featuring
                breakthrough reasoning capabilities, advanced code generation, and
                exceptional multilingual fluency. Built for complex, multi-step tasks
                with unmatched accuracy and depth.
              </p>
              <button
                onClick={() => {
                  sessionStorage.setItem("opus-46-toast-dismissed", "true")
                  toast.dismiss(t)
                }}
                className="w-full mt-1 px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "bottom-right" }
      )
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateKey = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const res = await fetch("/api/app-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "My API Key" }),
      })
      const data = await res.json()
      if (res.ok) {
        setKeys([data, ...keys])
        setNewKeyName("")
        setIsCreateModalOpen(false)
        toast.success("API Key berhasil dibuat")
      } else {
        toast.error(data.error || "Gagal membuat API Key")
      }
    } catch (_error) {
      toast.error("Terjadi kesalahan saat membuat API Key")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch("/api/app-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== id))
        toast.success("API Key berhasil dihapus")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus API Key")
      }
    } catch (_error) {
      toast.error("Terjadi kesalahan saat menghapus API Key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    toast.success("API Key disalin")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <LayoutApp hideHeader={true}>
      <div className="flex flex-col min-h-full bg-background text-foreground">
        {/* Banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-muted/30 border-b border-border px-4 py-2 flex items-center justify-center gap-4 text-sm"
            >
              <span>We have updated our <a href="#" className="text-primary hover:underline">Terms of Service</a></span>
              <button 
                onClick={() => setShowBanner(false)}
                className="px-4 py-1.5 rounded-full border border-border hover:bg-muted transition-colors font-medium"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-4 py-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors text-foreground">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-normal">Visora Labs API Key</h1>
            </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full transition-colors text-foreground">
              <FileText size={24} />
            </button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
              variant="outline"
              className="rounded-full px-6 font-medium shadow-none h-10"
            >
              Create API key
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 flex flex-col px-4 md:px-8 pb-12 mt-4",
          !loading && keys.length === 0 ? "items-center justify-center text-center max-w-2xl mx-auto" : "w-full max-w-7xl mx-auto"
        )}>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full" />
                <div className="w-48 h-6 bg-muted rounded" />
                <div className="w-64 h-4 bg-muted rounded" />
              </div>
            </div>
          ) : keys.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkle size={120} weight="thin" className="text-muted" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl font-medium text-foreground">No API keys found</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You haven&apos;t created any API keys yet. Create one to start using the Visora API.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="mt-6">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium text-muted-foreground py-4 px-6 h-auto">Name</TableHead>
                      <TableHead className="font-medium text-muted-foreground py-4 px-6 h-auto">API Key</TableHead>
                      <TableHead className="font-medium text-muted-foreground py-4 px-6 h-auto">Created</TableHead>
                      <TableHead className="font-medium text-muted-foreground py-4 px-6 h-auto">Last Used</TableHead>
                      <TableHead className="text-right font-medium text-muted-foreground py-4 px-6 h-auto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {keys.map((apiKey) => (
                        <motion.tr
                          key={apiKey.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedKey(apiKey)}
                        >
                          <TableCell className="py-4 px-6 font-medium text-foreground">{apiKey.name}</TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <code className="font-mono text-sm text-muted-foreground tracking-tight">
                                {apiKey.key ? `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}` : 'N/A'}
                              </code>
                              <button
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (apiKey.key) copyToClipboard(apiKey.key)
                                }}
                              >
                                {copiedKey === apiKey.key ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground text-sm whitespace-nowrap">
                            {apiKey.created_at ? new Date(apiKey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground text-sm whitespace-nowrap">
                            {apiKey.last_used_at
                              ? new Date(apiKey.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : "Never used"}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <button
                              className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteKey(apiKey.id)
                              }}
                            >
                              <Trash size={18} />
                            </button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!selectedKey} onOpenChange={(open) => !open && setSelectedKey(null)}>
        <DrawerContent className="max-h-[90vh] bg-background text-foreground">
          <div className="mx-auto w-full max-w-3xl overflow-y-auto">
            <DrawerHeader className="border-b border-border pb-6">
              <div className="flex items-center gap-4 text-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Key size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <DrawerTitle className="text-2xl font-normal">{selectedKey?.name}</DrawerTitle>
                  <DrawerDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={14} />
                      Created: {selectedKey && new Date(selectedKey.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={14} />
                      Last used: {selectedKey?.last_used_at ? new Date(selectedKey.last_used_at).toLocaleString() : "Never"}
                    </span>
                  </DrawerDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border-border"
                  onClick={() => selectedKey && copyToClipboard(selectedKey.key)}
                >
                  {copiedKey === selectedKey?.key ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  Copy Key
                </Button>
              </div>
            </DrawerHeader>

            <div className="p-6 space-y-6 pb-12 text-foreground">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Terminal size={16} />
                    Implementation Guide
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Integrate Visora into your application using the examples below.
                  </p>
                </div>

                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
                      <TabsTrigger value="curl" className="rounded-md">cURL</TabsTrigger>
                      <TabsTrigger value="javascript" className="rounded-md">JS</TabsTrigger>
                      <TabsTrigger value="go" className="rounded-md">Go</TabsTrigger>
                      <TabsTrigger value="php" className="rounded-md">PHP</TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                    <TabsContent value="curl">
                      {selectedKey && (
                        <CodeBlock>
                          <CodeBlockGroup className="flex h-9 items-center justify-between border-b px-4 bg-muted/50">
                            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">curl</div>
                            <ButtonCopy code={`curl -X POST https://genapi.visora.my.id/v1/chat/completions \\
  -H "Authorization: Bearer ${selectedKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Halo!" }
    ]
  }'`} />
                          </CodeBlockGroup>
                          <CodeBlockCode 
                            code={`curl -X POST https://genapi.visora.my.id/v1/chat/completions \\
  -H "Authorization: Bearer ${selectedKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Halo!" }
    ]
  }'`} 
                            language="bash" 
                          />
                        </CodeBlock>
                      )}
                    </TabsContent>
                    <TabsContent value="javascript">
                      {selectedKey && (
                        <CodeBlock>
                          <CodeBlockGroup className="flex h-9 items-center justify-between border-b px-4 bg-muted/50">
                            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">javascript</div>
                            <ButtonCopy code={`const response = await fetch('https://genapi.visora.my.id/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${selectedKey.key}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Halo!' }]
  })
});

const data = await response.json();
console.log(data);`} />
                          </CodeBlockGroup>
                          <CodeBlockCode 
                            code={`const response = await fetch('https://genapi.visora.my.id/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${selectedKey.key}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Halo!' }]
  })
});

const data = await response.json();
console.log(data);`} 
                            language="javascript" 
                          />
                        </CodeBlock>
                      )}
                    </TabsContent>
                    <TabsContent value="go">
                      {selectedKey && (
                        <CodeBlock>
                          <CodeBlockGroup className="flex h-9 items-center justify-between border-b px-4 bg-muted/50">
                            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">go</div>
                            <ButtonCopy code={`package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	url := "https://genapi.visora.my.id/v1/chat/completions"
	payload := map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]string{
			{"role": "user", "content": "Halo!"},
		},
	}
	
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Authorization", "Bearer ${selectedKey.key}")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}`} />
                          </CodeBlockGroup>
                          <CodeBlockCode 
                            code={`package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	url := "https://genapi.visora.my.id/v1/chat/completions"
	payload := map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]string{
			{"role": "user", "content": "Halo!"},
		},
	}
	
	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Authorization", "Bearer ${selectedKey.key}")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}`} 
                            language="go" 
                          />
                        </CodeBlock>
                      )}
                    </TabsContent>
                    <TabsContent value="php">
                      {selectedKey && (
                        <CodeBlock>
                          <CodeBlockGroup className="flex h-9 items-center justify-between border-b px-4 bg-muted/50">
                            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">php</div>
                            <ButtonCopy code={`<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://genapi.visora.my.id/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'gpt-4o',
    'messages' => [
        ['role' => 'user', 'content' => 'Halo!']
    ]
]));

$headers = [
    'Authorization: Bearer ${selectedKey.key}',
    'Content-Type: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`} />
                          </CodeBlockGroup>
                          <CodeBlockCode 
                            code={`<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://genapi.visora.my.id/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'gpt-4o',
    'messages' => [
        ['role' => 'user', 'content' => 'Halo!']
    ]
]));

$headers = [
    'Authorization: Bearer ${selectedKey.key}',
    'Content-Type: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`} 
                            language="php" 
                          />
                        </CodeBlock>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md p-8 rounded-[32px] gap-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">Create a new key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <Label htmlFor="key-name" className="text-base font-normal text-slate-700 ml-1">Name your key</Label>
                <Input
                  id="key-name"
                  placeholder="Your API KEY name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-5 text-lg placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-200 focus-visible:border-slate-300 transition-all shadow-none"
                />
            </div>
          </div>
          <DialogFooter className="flex-row justify-end items-center gap-4 sm:justify-end mt-4">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="text-lg font-semibold text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleCreateKey}
              disabled={isCreating}
              className="rounded-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 px-8 py-6 text-lg font-semibold shadow-sm h-auto transition-all active:scale-95"
            >
              {isCreating ? "Creating..." : "Create key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutApp>
  )
}
