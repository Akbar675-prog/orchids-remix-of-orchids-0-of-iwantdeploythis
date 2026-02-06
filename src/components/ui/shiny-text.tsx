"use client"

import { motion } from "framer-motion"

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
}: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block whitespace-nowrap bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, #b5b5b5 0%, #b5b5b5 35%, #ffffff 50%, #b5b5b5 65%, #b5b5b5 100%)`,
        backgroundSize: "200% auto",
      }}
      animate={
        disabled
          ? {}
          : {
              backgroundPosition: ["150% center", "-50% center"],
            }
      }
      transition={
        disabled
          ? {}
          : {
              duration: speed,
              repeat: Infinity,
              ease: "linear",
            }
      }
    >
      {text}
    </motion.span>
  )
}
