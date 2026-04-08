import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { families } from '../data/families'
import { COLORS } from '../utils/constants'
import { randomRange, distance } from '../utils/math'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  baseVx: number
  baseVy: number
  size: number
  opacity: number
  isGold: boolean
  familyIndex: number | null
}

const DOT_COUNT = 1500

export default function Screen4Constellation() {
  const setScreen = useAppStore((s) => s.setScreen)
  const incrementVideosWatched = useAppStore((s) => s.incrementVideosWatched)
  const videosWatched = useAppStore((s) => s.videosWatched)
  const { play, stop } = useAudio()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const animRef = useRef(0)
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const closestActiveRef = useRef<number | null>(null) // track which active dot is closest

  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [showIntroText, setShowIntroText] = useState(true)

  // Simple animation state: idle → opening → open → closing → idle
  const [animPhase, setAnimPhase] = useState<'idle' | 'opening' | 'open' | 'closing'>('idle')
  const [dotOrigin, setDotOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  // Init dots
  useEffect(() => {
    play('etherealPad')
    const w = window.innerWidth
    const h = window.innerHeight
    const dots: Dot[] = []

    // Active family dots — spread them well apart
    families.forEach((_, i) => {
      const angle = (i / families.length) * Math.PI * 2 - Math.PI / 2
      const radius = Math.min(w, h) * 0.28
      dots.push({
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: randomRange(-0.1, 0.1),
        vy: randomRange(-0.1, 0.1),
        baseVx: randomRange(-0.1, 0.1),
        baseVy: randomRange(-0.1, 0.1),
        size: 7,
        opacity: 1,
        isGold: true,
        familyIndex: i,
      })
    })

    // Decorative dots
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: randomRange(0, w),
        y: randomRange(0, h),
        vx: randomRange(-0.3, 0.3),
        vy: randomRange(-0.3, 0.3),
        baseVx: randomRange(-0.3, 0.3),
        baseVy: randomRange(-0.3, 0.3),
        size: randomRange(1, 3.5),
        opacity: randomRange(0.15, 0.6),
        isGold: Math.random() > 0.7,
        familyIndex: null,
      })
    }

    dotsRef.current = dots
    setTimeout(() => setShowIntroText(false), 3000)

    return () => {
      stop('etherealPad')
      cancelAnimationFrame(animRef.current)
    }
  }, [play, stop])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)

    function animate() {
      ctx.clearRect(0, 0, w, h)
      const touch = touchRef.current
      const dots = dotsRef.current
      const time = Date.now() * 0.001

      // First pass: find which active dot is closest to cursor
      let closestIdx: number | null = null
      let closestDist = Infinity
      if (touch) {
        for (const dot of dots) {
          if (dot.familyIndex === null) continue
          const d = distance(dot.x, dot.y, touch.x, touch.y)
          if (d < closestDist) {
            closestDist = d
            closestIdx = dot.familyIndex
          }
        }
      }
      closestActiveRef.current = closestDist < 250 ? closestIdx : null

      // Second pass: physics + draw
      for (const dot of dots) {
        if (touch) {
          const dist = distance(dot.x, dot.y, touch.x, touch.y)

          if (dot.familyIndex !== null) {
            const isClosest = dot.familyIndex === closestActiveRef.current

            if (isClosest && dist > 5) {
              // CLOSEST active dot: attract gently toward cursor
              const force = Math.min((250 - dist) / 250, 1) * 0.06
              dot.vx += ((touch.x - dot.x) / dist) * force
              dot.vy += ((touch.y - dot.y) / dist) * force
              // Strong damping — it slows to a stop near cursor
              dot.vx *= 0.9
              dot.vy *= 0.9
            } else if (!isClosest && dist < 200 && dist > 0) {
              // OTHER active dots: gently repel away from cursor
              const force = (200 - dist) / 200 * 0.15
              dot.vx += ((dot.x - touch.x) / dist) * force
              dot.vy += ((dot.y - touch.y) / dist) * force
            }
          } else {
            // Decorative dots: repel
            if (dist < 150 && dist > 0) {
              const force = (150 - dist) / 150
              dot.vx += ((dot.x - touch.x) / dist) * force * 0.5
              dot.vy += ((dot.y - touch.y) / dist) * force * 0.5
            }
          }
        }

        dot.vx += (dot.baseVx - dot.vx) * 0.02
        dot.vy += (dot.baseVy - dot.vy) * 0.02
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < -10) dot.x = w + 10
        if (dot.x > w + 10) dot.x = -10
        if (dot.y < -10) dot.y = h + 10
        if (dot.y > h + 10) dot.y = -10

        const cursorDist = touch ? distance(dot.x, dot.y, touch.x, touch.y) : 999
        const alpha = dot.opacity * (dot.familyIndex !== null ? 0.6 + Math.sin(time * 2 + (dot.familyIndex ?? 0)) * 0.4 : 1)

        if (dot.familyIndex !== null) {
          const isClosest = dot.familyIndex === closestActiveRef.current

          // Only the closest dot grows; others stay normal
          const proximityScale = isClosest && cursorDist < 150
            ? 1 + (1 - cursorDist / 150) * 2
            : 1
          const drawSize = dot.size * proximityScale
          const glowIntensity = isClosest && cursorDist < 150
            ? 0.2 + (1 - cursorDist / 150) * 0.5
            : 0.08

          // Outer glow
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, drawSize * 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha * glowIntensity * 0.4})`
          ctx.fill()

          // Middle glow
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, drawSize * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha * glowIntensity})`
          ctx.fill()

          // Core dot
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, drawSize, 0, Math.PI * 2)
          ctx.fillStyle = isClosest && cursorDist < 150
            ? `rgba(255, 240, 180, ${alpha})`
            : `rgba(212, 175, 55, ${alpha})`
          ctx.fill()

          // "Tap" label only on closest
          if (isClosest && cursorDist < 80) {
            ctx.font = '12px Inter, system-ui, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = `rgba(212, 175, 55, ${0.7 * (1 - cursorDist / 80)})`
            ctx.fillText('Tap', dot.x, dot.y + drawSize + 18)
          }
        } else {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
          ctx.fillStyle = dot.isGold
            ? `rgba(212, 175, 55, ${alpha})`
            : `rgba(80, 80, 90, ${alpha})`
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      touchRef.current = { x: e.clientX, y: e.clientY }
      swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }

      if (activeVideo !== null) return

      // Find the closest active dot
      let best: { idx: number; dist: number } | null = null
      for (const dot of dotsRef.current) {
        if (dot.familyIndex === null) continue
        const d = distance(e.clientX, e.clientY, dot.x, dot.y)
        if (d < 60 && (!best || d < best.dist)) {
          best = { idx: dot.familyIndex, dist: d }
        }
      }

      if (best) {
        const dot = dotsRef.current.find(d => d.familyIndex === best!.idx)
        if (dot) setDotOrigin({ x: dot.x, y: dot.y })
        play('chimeSoft')
        setActiveVideo(best.idx)
        setAnimPhase('opening')
        incrementVideosWatched()
        // After animation completes, mark as fully open
        setTimeout(() => setAnimPhase('open'), 700)
      }
    },
    [play, incrementVideosWatched, activeVideo]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    touchRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      touchRef.current = null

      const start = swipeStartRef.current
      if (start) {
        const dx = e.clientX - start.x
        const dy = Math.abs(e.clientY - start.y)
        const dt = Date.now() - start.time

        if (dx < -100 && dy < 150 && dt < 800) {
          stop('etherealPad')
          setScreen(Screen.TrustCompact)
          return
        }
      }
      swipeStartRef.current = null
    },
    [setScreen, stop]
  )

  const closeVideo = useCallback(() => {
    setAnimPhase('closing')
    setTimeout(() => {
      setActiveVideo(null)
      setAnimPhase('idle')
    }, 500)
  }, [])

  return (
    <div
      className="w-full h-full relative overflow-hidden screen-enter"
      style={{ background: COLORS.nightSky }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Intro text */}
      {showIntroText && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <p
            className="font-display text-4xl tracking-wide text-center"
            style={{ color: COLORS.pearl, textShadow: '0 0 40px rgba(0,0,0,0.8)' }}
          >
            A legacy of life, measured in trust.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
        <p className="text-sm tracking-wider" style={{ color: COLORS.gold }}>
          10,000+ Happy Families
        </p>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-xs tracking-widest text-pearl/25">
          Tap glowing dots to explore
        </p>
      </div>

      {/* Back arrow on left side — matching style as NEXT */}
      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
        onPointerDown={(e) => {
          e.stopPropagation()
          stop('etherealPad')
          setScreen(Screen.Timeline)
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border breathing"
            style={{
              borderColor: COLORS.gold,
              background: 'rgba(212,175,55,0.08)',
              boxShadow: `0 0 25px rgba(212,175,55,0.2)`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M11 19l-6-7 6-7" />
            </svg>
          </div>
          <p className="text-[10px] tracking-widest" style={{ color: COLORS.gold, opacity: 0.6 }}>
            BACK
          </p>
        </div>
      </div>

      {/* Forward arrow on right side */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
        onPointerDown={(e) => {
          e.stopPropagation()
          stop('etherealPad')
          setScreen(Screen.TrustCompact)
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border breathing"
            style={{
              borderColor: COLORS.gold,
              background: 'rgba(212,175,55,0.08)',
              boxShadow: `0 0 25px rgba(212,175,55,0.2)`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 5l6 7-6 7" />
            </svg>
          </div>
          <p className="text-[10px] tracking-widest" style={{ color: COLORS.gold, opacity: 0.6 }}>
            NEXT
          </p>
        </div>
      </div>

      {/* Video modal — single unified animation, no DOM swaps */}
      {activeVideo !== null && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          onPointerDown={(e) => {
            e.stopPropagation()
            if (animPhase === 'open') closeVideo()
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(12px)',
              opacity: animPhase === 'closing' ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          />

          {/* Close button */}
          <div
            className="absolute top-8 right-8 z-40 cursor-pointer"
            style={{
              animation: animPhase !== 'closing' ? 'fadeSlideUp 0.4s ease-out 0.4s both' : undefined,
              opacity: animPhase === 'closing' ? 0 : undefined,
              transition: animPhase === 'closing' ? 'opacity 0.3s ease' : undefined,
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              closeVideo()
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
              style={{
                borderColor: 'rgba(212,175,55,0.4)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Row: LEFT TV — CENTER CIRCLE — RIGHT TV (all animate together) */}
          <div
            className="relative z-10 flex items-center justify-center"
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              perspective: '1800px',
              gap: 'clamp(20px, 3vw, 50px)',
              opacity: animPhase === 'closing' ? 0 : 1,
              transform: animPhase === 'closing' ? 'scale(0.85)' : 'scale(1)',
              transition: animPhase === 'closing' ? 'opacity 0.4s ease, transform 0.4s ease' : undefined,
            }}
          >
            {/* LEFT TV — slides in from left with delay */}
            <div
              className="flex-shrink-0"
              style={{
                transformOrigin: 'right center',
                animation: 'tvSlideFromLeft 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
              }}
            >
              <div
                className="relative rounded-xl overflow-hidden w-[25vw] max-w-[420px] min-w-[180px] aspect-[16/10]"
                style={{
                  border: `2px solid rgba(212,175,55,0.5)`,
                  boxShadow: `0 6px 40px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.15)`,
                  background: '#080808',
                  padding: 'clamp(3px, 0.4vw, 6px)',
                }}
              >
                <div className="w-full h-full rounded-lg overflow-hidden bg-black relative">
                  <video src={families[activeVideo].video} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[clamp(36px,4vw,64px)] h-[clamp(36px,4vw,64px)] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', border: `1.5px solid rgba(212,175,55,0.4)` }}>
                      <svg className="w-[50%] h-[50%]" viewBox="0 0 24 24" fill={COLORS.gold}><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER CIRCLE — expands from the tapped dot position */}
            <div
              className="flex-shrink-0"
              style={{
                zIndex: 5,
                '--dot-x': `${dotOrigin.x - window.innerWidth / 2}px`,
                '--dot-y': `${dotOrigin.y - window.innerHeight / 2 + 40}px`,
                animation: 'dotExpandToCenter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
              } as React.CSSProperties}
            >
              <div
                className="rounded-full overflow-hidden w-[28vw] max-w-[440px] min-w-[200px] aspect-square"
                style={{
                  border: `3px solid ${COLORS.gold}`,
                  boxShadow: `0 0 80px rgba(212,175,55,0.3), 0 0 150px rgba(212,175,55,0.08), 0 10px 50px rgba(0,0,0,0.6)`,
                }}
              >
                <video src={families[activeVideo].video} className="w-full h-full object-cover" autoPlay muted playsInline loop />
              </div>
            </div>

            {/* RIGHT TV — slides in from right with delay */}
            <div
              className="flex-shrink-0"
              style={{
                transformOrigin: 'left center',
                animation: 'tvSlideFromRight 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
              }}
            >
              <div
                className="relative rounded-xl overflow-hidden w-[25vw] max-w-[420px] min-w-[180px] aspect-[16/10]"
                style={{
                  border: `2px solid rgba(212,175,55,0.5)`,
                  boxShadow: `0 6px 40px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.15)`,
                  background: '#080808',
                  padding: 'clamp(3px, 0.4vw, 6px)',
                }}
              >
                <div className="w-full h-full rounded-lg overflow-hidden bg-black relative">
                  <video src={families[activeVideo].video} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[clamp(36px,4vw,64px)] h-[clamp(36px,4vw,64px)] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', border: `1.5px solid rgba(212,175,55,0.4)` }}>
                      <svg className="w-[50%] h-[50%]" viewBox="0 0 24 24" fill={COLORS.gold}><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family info BELOW — fades up with delay */}
          <div
            className="relative z-10 text-center mt-[3vh]"
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              animation: animPhase !== 'closing' ? 'fadeSlideUp 0.5s ease-out 0.3s both' : undefined,
              opacity: animPhase === 'closing' ? 0 : undefined,
              transition: animPhase === 'closing' ? 'opacity 0.3s ease' : undefined,
            }}
          >
            <p className="font-display text-[clamp(1.2rem,2vw,1.5rem)]" style={{ color: COLORS.gold }}>
              {families[activeVideo].name}
            </p>
            <p className="mt-2 font-display text-[clamp(0.9rem,1.3vw,1.15rem)] italic text-pearl/60 max-w-md mx-auto">
              &ldquo;{families[activeVideo].quote}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
