import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlobeIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import React, { useState } from "react"
import { AuthBottomSheet } from "./auth-bottom-sheet"

type ButtonSearchProps = {
  isSelected?: boolean
  onToggle?: (isSelected: boolean) => void
  isAuthenticated: boolean
}

export function ButtonSearch({
  isSelected = false,
  onToggle,
  isAuthenticated,
}: ButtonSearchProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true)
      return
    }
    const newState = !isSelected
    onToggle?.(newState)
  }

  const content = (
    <>
      <Button
        variant="secondary"
        className={cn(
          "border-border dark:bg-secondary relative flex items-center gap-1 rounded-full border bg-transparent transition-all duration-300 ease-in-out has-[>svg]:px-2",
          isSelected &&
            "border-[#0091FF]/20 bg-[#E5F3FE] text-[#0091FF] hover:bg-[#E5F3FE] hover:text-[#0091FF]"
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlobeIcon className="size-5" />
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: "auto", opacity: 1, marginLeft: 4 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap text-sm font-medium"
            >
              Search
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AuthBottomSheet
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
      />
    </>
  )

  return content
}

