import * as React from "react"
import type { SVGProps } from "react"

export default function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill="#1877F2" stroke="none" />
      <path
        d="M15.5 13.5H13.5V20H11V13.5H9.5V11.5H11V10C11 8.5 11.5 7 13.5 7H15.5V9H14.5C13.5 9 13.5 9.5 13.5 10V11.5H15.5L15 13.5Z"
        fill="white"
        stroke="none"
      />
    </svg>
  )
}
