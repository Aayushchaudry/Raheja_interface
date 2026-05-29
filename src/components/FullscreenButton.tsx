import { useCallback, useEffect, useState } from 'react'
import { COLORS } from '../utils/constants'

// Global bottom-right button that toggles browser fullscreen.
// Style mirrors BackButton for visual consistency.
export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' && !!document.fullscreenElement
  )

  // Keep icon in sync if the user exits via Esc or F11
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }, [])

  return (
    <div
      className="absolute bottom-[3vh] right-[2vw] z-40 cursor-pointer"
      onPointerDown={(e) => {
        e.stopPropagation()
        toggle()
      }}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      <div
        className="w-[clamp(36px,3.5vw,48px)] h-[clamp(36px,3.5vw,48px)] rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
        style={{
          borderColor: 'rgba(212,175,55,0.3)',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <svg
          className="w-[45%] h-[45%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.gold}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isFullscreen ? (
            // Exit fullscreen — corner arrows pointing inward
            <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
          ) : (
            // Enter fullscreen — corner arrows pointing outward
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          )}
        </svg>
      </div>
    </div>
  )
}
