import { useAppStore } from '../store/useAppStore'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'

// Screen flow order for back navigation
const SCREEN_ORDER: Screen[] = [
  Screen.Standby,
  Screen.Timeline,
  Screen.Constellation,
  Screen.TrustCompact,
  Screen.LuxeReveal,
  Screen.CTA,
]

export default function BackButton() {
  const currentScreen = useAppStore((s) => s.currentScreen)
  const setScreen = useAppStore((s) => s.setScreen)

  const currentIndex = SCREEN_ORDER.indexOf(currentScreen)
  if (currentIndex <= 1) return null // No back on Standby or Timeline (first interactive screen)

  const prevScreen = SCREEN_ORDER[currentIndex - 1]

  return (
    <div
      className="absolute top-[3vh] left-[2vw] z-40 cursor-pointer"
      onPointerDown={(e) => {
        e.stopPropagation()
        setScreen(prevScreen)
      }}
    >
      <div
        className="w-[clamp(36px,3.5vw,48px)] h-[clamp(36px,3.5vw,48px)] rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
        style={{
          borderColor: 'rgba(212,175,55,0.3)',
          background: 'rgba(0,0,0,0.3)',
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
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  )
}
