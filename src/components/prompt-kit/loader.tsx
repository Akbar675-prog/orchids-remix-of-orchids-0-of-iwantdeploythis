"use client"

export function Loader() {
  return (
    <div className="flex h-10 items-center justify-center py-2" aria-label="Loading">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="text-muted-foreground/60"
        style={{ opacity: 1 }}
      >
        <circle cx="4" cy="12" r="3" fill="currentColor">
          <animate
            id="loader-dot1"
            fill="freeze"
            attributeName="opacity"
            begin="0;loader-dot3.end-0.25s"
            dur="0.75s"
            values="1;.2"
          />
        </circle>
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".4">
          <animate
            fill="freeze"
            attributeName="opacity"
            begin="loader-dot1.begin+0.15s"
            dur="0.75s"
            values="1;.2"
          />
        </circle>
        <circle cx="20" cy="12" r="3" fill="currentColor" opacity=".3">
          <animate
            id="loader-dot3"
            fill="freeze"
            attributeName="opacity"
            begin="loader-dot1.begin+0.3s"
            dur="0.75s"
            values="1;.2"
          />
        </circle>
      </svg>
    </div>
  )
}
