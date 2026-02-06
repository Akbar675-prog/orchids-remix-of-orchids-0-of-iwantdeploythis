import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Visora AI — Our Vision & Mission",
  description: "Pelajari lebih lanjut tentang Visora AI, visi kami, dan teknologi di balik platform AI Labs modern ini.",
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
