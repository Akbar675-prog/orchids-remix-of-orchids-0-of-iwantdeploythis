import fs from "fs"
import path from "path"

export async function saveImageFromPollinations(prompt: string, id: string): Promise<string> {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?style=realistic&size=1024x1024&nologo=true`
  
  const dir = "/tmp/user/image"
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const filePath = path.join(dir, `${id}.jpg`)
  
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  fs.writeFileSync(filePath, buffer)
  
  return filePath
}

export function generateImageId(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
