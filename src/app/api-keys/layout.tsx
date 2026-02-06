import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visora Labs API Key — Access & Developer Dashboard",
  description: "Halaman resmi Visora Labs untuk mendapatkan API Key dan akses developer.",
}

export default function ApiKeysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
