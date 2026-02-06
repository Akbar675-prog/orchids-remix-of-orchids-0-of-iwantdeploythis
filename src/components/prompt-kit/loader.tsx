"use client"

export function Loader() {
  return (
    <div className="flex h-10 items-center justify-center py-2" aria-label="Loading">
      <div className="dot-flashing" />
      <style jsx>{`
        .dot-flashing {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a0a0a0;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
        }
        .dot-flashing::before,
        .dot-flashing::after {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a0a0a0;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a0a0a0;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% {
            background-color: #a0a0a0;
          }
          50%, 100% {
            background-color: rgba(160, 160, 160, 0.2);
          }
        }
      `}</style>
    </div>
  )
}
