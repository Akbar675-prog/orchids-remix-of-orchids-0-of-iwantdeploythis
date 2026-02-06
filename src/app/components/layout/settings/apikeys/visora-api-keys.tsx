"use client"

import { Button } from "@/components/ui/button"
import { ArrowRightIcon, KeyIcon } from "@phosphor-icons/react"
import Link from "next/link"

export function VisoraApiKeysSection() {
  return (
    <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/20 p-2 text-primary">
          <KeyIcon className="size-6" weight="fill" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-primary">Visora Developer API</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gunakan API Visora untuk mengintegrasikan model AI seperti GPT-5.2, Grok 4 Heavy, dan Google Search ke dalam aplikasi Anda sendiri. Buat API Key khusus untuk akses terprogram yang aman.
          </p>
          <div className="pt-3">
            <Button asChild variant="default" size="sm" className="gap-2">
              <Link href="/api-keys">
                Kelola API Keys Anda
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
