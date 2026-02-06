export type ChatIntent = "chat" | "image_generation"

export function classifyIntent(query: string): ChatIntent {
  const lowercaseQuery = query.toLowerCase()

  // Keywords for code and technical content
  const codeKeywords = [
    "kode",
    "html",
    "css",
    "js",
    "javascript",
    "script",
    "program",
    "coding",
    "python",
    "java",
    "typescript",
    "json",
    "sql",
    "php",
    "cpp",
    "c#",
    "ruby",
    "swift",
    "kotlin",
    "rust",
    "golang",
  ]

  // Keywords for textual content
  const textKeywords = [
    "teks",
    "tulisan",
    "artikel",
    "surat",
    "puisi",
    "cerita",
    "esei",
    "naskah",
    "dokumen",
    "laporan",
    "deskripsi",
    "penjelasan",
    "tutorial",
    "cara",
    "langkah",
    "saran",
    "ide",
  ]

  // Keywords for image-related requests
  const imageKeywords = [
    "gambar",
    "image",
    "foto",
    "lukis",
    "pic",
    "picture",
    "photo",
    "kartun",
    "ilustrasi",
    "visual",
    "potret",
    "sketsa",
    "wallpaper",
    "avatar",
    "logo",
    "ikon",
    "icon",
  ]

  // Action keywords that usually accompany image requests
  const imageActionKeywords = [
    "buat",
    "generate",
    "bikin",
    "create",
    "draw",
    "lukiskan",
    "tampilkan",
    "render",
    "design",
    "gambarkan",
    "buatkan",
  ]

  const hasCodeKeyword = codeKeywords.some((kw) => lowercaseQuery.includes(kw))
  const hasTextKeyword = textKeywords.some((kw) => lowercaseQuery.includes(kw))
  const hasImageKeyword = imageKeywords.some((kw) => lowercaseQuery.includes(kw))
  const hasImageAction = imageActionKeywords.some((kw) =>
    lowercaseQuery.includes(kw)
  )

  // RULE 1: If it contains code or text keywords, it's almost certainly a chat request
  // even if it says "buatkan gambar kode" (which is an edge case, but usually means code for an image)
  if (hasCodeKeyword || hasTextKeyword) {
    return "chat"
  }

  // RULE 2: Specific "image-only" commands
  if (
    lowercaseQuery.startsWith("gambar ") ||
    lowercaseQuery.startsWith("lukis ") ||
    lowercaseQuery.startsWith("draw ") ||
    lowercaseQuery.startsWith("generate image ")
  ) {
    return "image_generation"
  }

  // RULE 3: Combination of action + image keyword
  // We check if "buatkan" or similar is used WITH an image keyword
  if (hasImageAction && hasImageKeyword) {
    // Extra check to ensure it's not something like "buatkan penjelasan tentang gambar"
    // If "tentang" or "mengenai" or "apa itu" is used, it's likely chat
    const isExplaining = ["tentang", "mengenai", "apa itu", "jelaskan", "bagaimana"].some(kw => lowercaseQuery.includes(kw))
    if (isExplaining) return "chat"
    
    return "image_generation"
  }

  // Default to chat
  return "chat"
}
