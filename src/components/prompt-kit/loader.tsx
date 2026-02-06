"use client"

export function Loader() {
  return (
    <div className="flex h-10 items-center justify-center py-2" aria-label="Loading">
      <svg
        width="40"
        height="16"
        viewBox="0 0 60 24"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-muted-foreground/60"
      >
        <circle cx="10" cy="12" r="5">
          <animate
            attributeName="cy"
            begin="0s"
            dur="0.9s"
            values="12;6;12"
            calcMode="spline"
            keySplines="0.45, 0.05, 0.55, 0.95; 0.45, 0.05, 0.55, 0.95"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="30" cy="12" r="5">
          <animate
            attributeName="cy"
            begin="0.15s"
            dur="0.9s"
            values="12;6;12"
            calcMode="spline"
            keySplines="0.45, 0.05, 0.55, 0.95; 0.45, 0.05, 0.55, 0.95"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="12" r="5">
          <animate
            attributeName="cy"
            begin="0.3s"
            dur="0.9s"
            values="12;6;12"
            calcMode="spline"
            keySplines="0.45, 0.05, 0.55, 0.95; 0.45, 0.05, 0.55, 0.95"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  )
}
