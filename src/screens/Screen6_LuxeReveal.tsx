import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'

const VIDEO_SRC = '/assets/videos/raheja-website.mp4'
const SCRUB_THRESHOLD_PX = 8

export default function Screen6LuxeReveal() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showText, setShowText] = useState(false)

  const dragRef = useRef<{
    startX: number
    startTime: number
    active: boolean
    wasPlaying: boolean
  } | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    play('luxeAmbient')

    const tryPlay = () => {
      video.play().catch(() => {
        video.muted = true
        video.play().catch(() => {})
      })
    }
    tryPlay()

    return () => {
      stop('luxeAmbient')
    }
  }, [play, stop])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration) return
    if (video.currentTime / video.duration > 0.85 && !showText) {
      setShowText(true)
    }
  }, [showText])

  const handleEnded = useCallback(() => {
    setScreen(Screen.CTA)
  }, [setScreen])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const video = videoRef.current
    if (!video) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startTime: video.currentTime,
      active: false,
      wasPlaying: !video.paused,
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const video = videoRef.current
    const drag = dragRef.current
    if (!video || !drag || !video.duration) return

    const dx = e.clientX - drag.startX

    if (!drag.active) {
      if (Math.abs(dx) < SCRUB_THRESHOLD_PX) return
      drag.active = true
      video.pause()
    }

    const fraction = dx / window.innerWidth
    const next = drag.startTime + fraction * video.duration
    video.currentTime = Math.max(0, Math.min(video.duration - 0.05, next))
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const video = videoRef.current
    const drag = dragRef.current
    if (!video || !drag) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    if (drag.active && drag.wasPlaying) {
      video.play().catch(() => {})
    }
    dragRef.current = null
  }, [])

  return (
    <div
      className="w-full h-full bg-charcoal relative overflow-hidden screen-enter"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none', cursor: 'ew-resize' }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {showText && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 pointer-events-none">
          <h1
            className="font-display text-[clamp(3rem,6vw,5.5rem)] tracking-[0.2em] uppercase"
            style={{
              color: COLORS.gold,
              textShadow: `0 0 30px rgba(212,175,55,0.4)`,
              animation: 'screenFadeIn 1s ease-out forwards',
            }}
          >
            Proven Trust. Refined.
          </h1>
          <p
            className="mt-4 font-display text-[clamp(1.1rem,2vw,1.6rem)] italic tracking-wider text-pearl/80"
            style={{ animation: 'screenFadeIn 1s ease-out 0.5s forwards', opacity: 0 }}
          >
            Step into your first true sanctuary of vision.
          </p>
        </div>
      )}
    </div>
  )
}
