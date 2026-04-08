import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { AudioManager } from '../audio/AudioManager'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const setScreen = useAppStore((s) => s.setScreen)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Preload audio
      await AudioManager.preload()
      if (cancelled) return
      setProgress(40)

      // Preload critical images
      const imageUrls = Array.from({ length: 8 }, (_, i) => `/assets/images/projects/project-${i + 1}.jpg`)
      await Promise.all(
        imageUrls.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.onload = () => resolve()
              img.onerror = () => resolve()
              img.src = src
            })
        )
      )
      if (cancelled) return
      setProgress(80)

      // Small delay for visual polish
      await new Promise((r) => setTimeout(r, 500))
      if (cancelled) return
      setProgress(100)

      await new Promise((r) => setTimeout(r, 400))
      if (cancelled) return
      setScreen(Screen.Standby)
    }

    load()
    return () => { cancelled = true }
  }, [setScreen])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal screen-enter">
      {/* Logo */}
      <div
        className="font-display text-4xl tracking-widest mb-16"
        style={{ color: COLORS.gold }}
      >
        RAHEJA LUXE
      </div>

      {/* Progress bar */}
      <div className="w-64 h-0.5 bg-pearl/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          }}
        />
      </div>

      {/* Progress text */}
      <div className="mt-4 text-sm text-pearl/30 tracking-wider">
        {progress < 100 ? 'Loading experience...' : 'Ready'}
      </div>
    </div>
  )
}
