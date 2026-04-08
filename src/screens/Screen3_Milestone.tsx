import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { milestones } from '../data/milestones'
import { COLORS } from '../utils/constants'
import gsap from 'gsap'

export default function Screen3Milestone() {
  const selectedIndex = useAppStore((s) => s.selectedMilestoneIndex)
  const setScreen = useAppStore((s) => s.setScreen)
  const setSelectedMilestone = useAppStore((s) => s.setSelectedMilestone)
  const { play } = useAudio()

  const [currentIndex, setCurrentIndex] = useState(selectedIndex)
  const [isModern, setIsModern] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [statCount, setStatCount] = useState(0)

  const photoRef = useRef<HTMLDivElement>(null)
  const rippleCanvasRef = useRef<HTMLCanvasElement>(null)
  const swipeStartRef = useRef(0)

  const milestone = milestones[currentIndex]

  // Parse number from stat text for counting animation
  const statNumber = parseInt(milestone.stat.match(/\d+/)?.[0] || '0', 10)

  // Count-up animation
  useEffect(() => {
    setStatCount(0)
    const duration = 1500
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setStatCount(Math.floor(progress * statNumber))
      if (progress >= 1) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [currentIndex, statNumber])

  // Hide hint after 3s
  useEffect(() => {
    setShowHint(true)
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [currentIndex])

  // Reset modern state on index change
  useEffect(() => {
    setIsModern(false)
  }, [currentIndex])

  const handleRippleTap = useCallback(
    (e: React.PointerEvent) => {
      play('waterPing')

      // Draw ripple on canvas
      const canvas = rippleCanvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        canvas.width = rect.width
        canvas.height = rect.height
        const ctx = canvas.getContext('2d')!

        let radius = 0
        const maxRadius = Math.max(rect.width, rect.height)

        function drawRipple() {
          ctx.clearRect(0, 0, canvas!.width, canvas!.height)
          radius += 12

          if (radius < maxRadius) {
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(212, 175, 55, ${1 - radius / maxRadius})`
            ctx.lineWidth = 3
            ctx.stroke()
            requestAnimationFrame(drawRipple)
          } else {
            ctx.clearRect(0, 0, canvas!.width, canvas!.height)
          }
        }
        drawRipple()
      }

      // Toggle modern/sepia
      setTimeout(() => {
        setIsModern((prev) => !prev)
        if (!isModern) play('celloSustain')
      }, 300)
    },
    [play, isModern]
  )

  const handleSwipeStart = useCallback((e: React.PointerEvent) => {
    swipeStartRef.current = e.clientX
  }, [])

  const handleSwipeEnd = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - swipeStartRef.current
      if (Math.abs(dx) < 50) return // not a swipe

      if (dx < 0 && currentIndex < milestones.length - 1) {
        // Swipe left → next
        setCurrentIndex(currentIndex + 1)
        setSelectedMilestone(currentIndex + 1)
      } else if (dx > 0 && currentIndex > 0) {
        // Swipe right → prev
        setCurrentIndex(currentIndex - 1)
        setSelectedMilestone(currentIndex - 1)
      } else if (dx < 0 && currentIndex === milestones.length - 1) {
        // Past last milestone → Screen 4
        setScreen(Screen.Constellation)
      }
    },
    [currentIndex, setSelectedMilestone, setScreen]
  )

  const statDisplay = milestone.stat.replace(/\d+/, String(statCount))

  return (
    <div
      className="w-full h-full bg-charcoal flex flex-col items-center justify-center relative screen-enter"
      onPointerDown={handleSwipeStart}
      onPointerUp={handleSwipeEnd}
    >
      {/* Warm gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,109,56,0.15) 0%, #1A1A1B 70%)',
        }}
      />

      {/* Back button */}
      <button
        className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
        onClick={() => setScreen(Screen.Timeline)}
        style={{ color: COLORS.gold }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Milestone counter */}
      <div className="absolute top-8 right-8 z-20 text-pearl/40 text-sm tracking-wider">
        {currentIndex + 1} / {milestones.length}
      </div>

      {/* Photo frame */}
      <div
        ref={photoRef}
        className="relative w-[60vw] max-w-[900px] aspect-video rounded-lg overflow-hidden cursor-pointer z-10"
        style={{
          boxShadow: `0 0 40px rgba(212,175,55,0.15)`,
          border: `1px solid rgba(212,175,55,0.2)`,
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          handleRippleTap(e)
        }}
      >
        {/* Sepia image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${milestone.sepiaImage})`,
            backgroundColor: 'rgba(212,175,55,0.15)',
            filter: 'sepia(0.7) brightness(0.8)',
            opacity: isModern ? 0 : 1,
          }}
        />

        {/* Modern image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${milestone.modernImage})`,
            backgroundColor: 'rgba(100,160,200,0.15)',
            opacity: isModern ? 1 : 0,
          }}
        />

        {/* Ripple canvas overlay */}
        <canvas
          ref={rippleCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Stat overlay bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-6 py-3 z-10">
          <p className="font-display text-lg" style={{ color: COLORS.gold }}>
            {statDisplay}
          </p>
        </div>

        {/* Tap hint */}
        {showHint && (
          <div className="absolute top-4 right-4 text-xs text-pearl/50 bg-black/40 px-3 py-1 rounded-full z-10">
            Tap the photo
          </div>
        )}
      </div>

      {/* Narrative text */}
      <p
        className="mt-8 font-display text-xl italic tracking-wide z-10"
        style={{ color: COLORS.pearl }}
      >
        &ldquo;{milestone.narrative}&rdquo;
      </p>

      {/* Year and name */}
      <div className="mt-4 text-center z-10">
        <span className="text-3xl font-display" style={{ color: COLORS.gold }}>
          {milestone.year}
        </span>
        <span className="ml-4 text-pearl/60">{milestone.name}</span>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-sm text-pearl/30 tracking-wider">
          {currentIndex < milestones.length - 1
            ? 'Swipe to explore more milestones'
            : 'Swipe left to continue the journey'}
        </p>
      </div>
    </div>
  )
}
