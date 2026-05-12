import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'

type Phase = 'idle' | 'beam' | 'shatter' | 'flow' | 'matched'

interface DragState {
  sourceIndex: number
  sourceRect: { x: number; y: number; w: number; h: number }
  currentX: number
  currentY: number
}

interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
}

const DNA_PAIRS = [
  {
    heritage: { name: 'Raheja Tower', year: 2011, promise: 'Structural Integrity' },
    luxe: {
      title: 'Material Elevation',
      description: 'Material selection, evolved through global sourcing.',
    },
  },
  {
    heritage: { name: 'Raheja Residency', year: 2014, promise: 'Crafted Interiors' },
    luxe: {
      title: 'Artisanal Finish',
      description: 'Hand-crafted detailing, applied at scale.',
    },
  },
  {
    heritage: { name: 'Raheja Sky Scapes', year: 2016, promise: 'Connected Living' },
    luxe: {
      title: 'Intelligent Environments',
      description: 'Connected systems, tuned for wellness and predictive comfort.',
    },
  },
  {
    heritage: { name: 'Raheja Nirwana', year: 2021, promise: 'Curated Sanctuary' },
    luxe: {
      title: 'Ultra-Luxe Concierge',
      description: 'Global lifestyle management, scaled to 24/7 personal service.',
    },
  },
]

const HeritageIcons = [
  // tower
  <path d="M9 21V3h6v18M4 21h16M11 6h2M11 10h2M11 14h2M11 18h2" />,
  // residence
  <path d="M3 21h18M5 21V11l7-6 7 6v10M9 21v-6h6v6" />,
  // skyline / building tall
  <path d="M3 21h18M5 21V8l4-2 4 2v15M13 21V11l4-2 4 2v10M9 11h2M9 15h2M17 13h2M17 17h2" />,
  // sanctuary / leaf
  <path d="M4 21c0-9 6-15 16-16-1 10-7 16-16 16M4 21l9-9" />,
]

const LuxeIcons = [
  // material layers
  <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" />,
  // brush / artisanal
  <path d="M9 11V3h2v8M15 11V3h2v8M5 11h14M5 11v3a4 4 0 004 4h6a4 4 0 004-4v-3M12 18v3" />,
  // smart / wifi-home
  <path d="M3 21h18M5 21V11l7-6 7 6v10M9 14a3 3 0 016 0M11 18h2" />,
  // concierge / bell
  <path d="M6 17h12M5 14a7 7 0 0114 0M10 5a2 2 0 014 0M12 5v2M10 20h4" />,
]

export default function Screen5TrustCompact() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()

  const [phase, setPhase] = useState<Phase>('idle')
  const [activeSource, setActiveSource] = useState<number | null>(null)
  const [matchedIndex, setMatchedIndex] = useState<number | null>(null)

  const phaseRef = useRef<Phase>('idle')
  const dragRef = useRef<DragState | null>(null)
  const sparklesRef = useRef<Sparkle[]>([])
  const targetRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const sourceCardRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const flowProgressRef = useRef(0)
  const luxeCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const spineRef = useRef<HTMLDivElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function getSpineCenter(): { x: number; y: number } {
      const el = spineRef.current
      if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      const ph = phaseRef.current
      const drag = dragRef.current

      // Active beam from heritage to finger
      if (ph === 'beam' && drag) {
        const sx = drag.sourceRect.x + drag.sourceRect.w / 2
        const sy = drag.sourceRect.y + drag.sourceRect.h / 2
        const ex = drag.currentX
        const ey = drag.currentY
        const mx = (sx + ex) / 2
        const my = (sy + ey) / 2

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(mx, my, ex, ey)
        const grad = ctx.createLinearGradient(sx, sy, ex, ey)
        grad.addColorStop(0, 'rgba(212,175,55,0.35)')
        grad.addColorStop(0.5, 'rgba(212,175,55,0.85)')
        grad.addColorStop(1, 'rgba(245,230,163,0.95)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 3.5
        ctx.shadowColor = 'rgba(212,175,55,0.55)'
        ctx.shadowBlur = 18
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.shadowBlur = 0

        // Fingertip glow
        const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, 14)
        grd.addColorStop(0, 'rgba(245,230,163,0.8)')
        grd.addColorStop(1, 'rgba(212,175,55,0)')
        ctx.beginPath()
        ctx.arc(ex, ey, 14, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Source-to-spine beam during shatter/flow
      if ((ph === 'shatter' || ph === 'flow' || ph === 'matched') && sourceCardRef.current) {
        const src = sourceCardRef.current
        const sx = src.x + src.w
        const sy = src.y + src.h / 2
        const spine = getSpineCenter()
        const mx = (sx + spine.x) / 2
        const my = (sy + spine.y) / 2 - 30

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(mx, my, spine.x, spine.y)
        const grad = ctx.createLinearGradient(sx, sy, spine.x, spine.y)
        grad.addColorStop(0, 'rgba(212,175,55,0.6)')
        grad.addColorStop(1, 'rgba(245,230,163,0.95)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(212,175,55,0.6)'
        ctx.shadowBlur = 16
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Sparkle particles
      const sparkles = sparklesRef.current
      const targetingTarget = (ph === 'flow' || ph === 'matched') && targetRectRef.current
      const tx = targetingTarget ? targetRectRef.current!.x + 30 : 0
      const ty = targetingTarget ? targetRectRef.current!.y + targetRectRef.current!.h / 2 : 0

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        if (targetingTarget) {
          const dx = tx - s.x
          const dy = ty - s.y
          const d = Math.hypot(dx, dy) || 1
          s.vx += (dx / d) * 0.45
          s.vy += (dy / d) * 0.45
          s.vx *= 0.94
          s.vy *= 0.94
        }
        s.x += s.vx
        s.y += s.vy
        s.life -= 0.012
        if (s.life <= 0) {
          sparkles.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,230,163,${s.life})`
        ctx.shadowColor = 'rgba(212,175,55,0.7)'
        ctx.shadowBlur = 8
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // Spine-to-target beam during flow/matched
      if ((ph === 'flow' || ph === 'matched') && targetRectRef.current) {
        flowProgressRef.current = Math.min(1, flowProgressRef.current + 0.04)
        const t = targetRectRef.current
        const spine = getSpineCenter()
        const ex = t.x
        const ey = t.y + t.h / 2
        const mx = (spine.x + ex) / 2
        const my = (spine.y + ey) / 2 - 30

        const p = flowProgressRef.current
        // animate path with progress (draw 0..p)
        ctx.beginPath()
        const steps = 30
        for (let i = 0; i <= steps; i++) {
          const tt = (i / steps) * p
          const px = (1 - tt) * (1 - tt) * spine.x + 2 * (1 - tt) * tt * mx + tt * tt * ex
          const py = (1 - tt) * (1 - tt) * spine.y + 2 * (1 - tt) * tt * my + tt * tt * ey
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = 'rgba(245,230,163,0.8)'
        ctx.lineWidth = 2.5
        ctx.shadowColor = 'rgba(212,175,55,0.55)'
        ctx.shadowBlur = 14
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Validation ring burst on matched
      if (ph === 'matched' && targetRectRef.current) {
        const t = targetRectRef.current
        const cx = t.x + t.w / 2
        const cy = t.y + t.h / 2
        const time = Date.now() * 0.003
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2 + time
          const r = 50 + Math.sin(time * 2 + i) * 40
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5 + Math.random() * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212,175,55,${0.3 + Math.random() * 0.4})`
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const cancelDrag = useCallback(() => {
    stop('stringPull')
    play('descendingTone')
    dragRef.current = null
    sourceCardRef.current = null
    setActiveSource(null)
    setPhase('idle')
  }, [play, stop])

  const triggerShatter = useCallback(
    (index: number) => {
      const luxeEl = luxeCardRefs.current[index]
      if (!luxeEl) return
      const r = luxeEl.getBoundingClientRect()
      targetRectRef.current = { x: r.left, y: r.top, w: r.width, h: r.height }

      // Spawn sparkles at spine
      const spine = spineRef.current?.getBoundingClientRect()
      const sx = spine ? spine.left + spine.width / 2 : window.innerWidth / 2
      const sy = spine ? spine.top + spine.height / 2 : window.innerHeight / 2
      const sparkles: Sparkle[] = []
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 5
        sparkles.push({
          x: sx + (Math.random() - 0.5) * 10,
          y: sy + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.7,
          size: 1 + Math.random() * 2.5,
          life: 1,
        })
      }
      sparklesRef.current = sparkles
      flowProgressRef.current = 0

      stop('stringPull')
      play('metallicShimmer')
      setPhase('shatter')

      setTimeout(() => {
        play('validationClick')
        setPhase('flow')
      }, 500)

      setTimeout(() => {
        play('orchestralSwell')
        if (navigator.vibrate) navigator.vibrate([100, 50, 200])
        setMatchedIndex(index)
        setPhase('matched')
      }, 1400)

      setTimeout(() => {
        stop('metallicShimmer')
        setScreen(Screen.LuxeReveal)
      }, 4200)
    },
    [play, stop, setScreen]
  )

  const handleHeritageDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (phaseRef.current !== 'idle') return
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const srcRect = { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
      dragRef.current = {
        sourceIndex: index,
        sourceRect: srcRect,
        currentX: e.clientX,
        currentY: e.clientY,
      }
      sourceCardRef.current = srcRect
      setActiveSource(index)
      setPhase('beam')
      play('stringPull')
    },
    [play]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (phaseRef.current !== 'beam' || !dragRef.current) return
      dragRef.current = { ...dragRef.current, currentX: e.clientX, currentY: e.clientY }

      const spine = spineRef.current
      if (spine) {
        const r = spine.getBoundingClientRect()
        if (e.clientX >= r.left + r.width / 2) {
          triggerShatter(dragRef.current.sourceIndex)
        }
      }
    },
    [triggerShatter]
  )

  const handlePointerUp = useCallback(() => {
    if (phaseRef.current !== 'beam') return
    cancelDrag()
  }, [cancelDrag])

  return (
    <div
      className="w-full h-full bg-charcoal relative overflow-hidden screen-enter flex flex-col"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Subtle gold radial background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background:
            phase === 'matched'
              ? 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.10) 0%, #F8F9F9 60%)'
              : 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.04) 0%, #F8F9F9 70%)',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pt-[clamp(16px,2.5vh,32px)] text-center">
        <h1
          className="font-display text-[clamp(1.3rem,2.1vw,2.2rem)] tracking-[0.22em] uppercase"
          style={{ color: COLORS.gold }}
        >
          Rebuilding the Legacy DNA
        </h1>
        <p
          className="mt-1 text-[clamp(0.7rem,0.9vw,0.95rem)] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(60,60,70,0.5)' }}
        >
          Heritage, evolved into Raheja Luxe
        </p>
      </div>

      {/* Three columns */}
      <div className="relative z-10 flex-1 flex items-stretch px-[clamp(10px,1.5vw,30px)] pb-[clamp(20px,3vh,40px)] pt-[clamp(10px,1.5vh,24px)]">
        {/* LEFT — Heritage Anchors */}
        <div className="flex-1 flex flex-col justify-center">
          <p
            className="text-center text-[clamp(1rem,1.25vw,1.45rem)] font-display tracking-[0.18em] uppercase mb-[clamp(6px,0.9vh,14px)]"
            style={{ color: COLORS.gold, opacity: 0.7 }}
          >
            Heritage Anchors · 2011–2021
          </p>
          <div className="flex flex-col gap-[clamp(8px,1.3vh,16px)]">
            {DNA_PAIRS.map((pair, i) => {
              const isActive = activeSource === i && phase !== 'idle'
              const dimmed = phase !== 'idle' && activeSource !== i
              return (
                <div
                  key={i}
                  onPointerDown={(e) => handleHeritageDown(e, i)}
                  className="cursor-grab active:cursor-grabbing rounded-xl p-[clamp(14px,1.6vw,24px)] transition-all duration-300"
                  style={{
                    border: `1px solid ${isActive ? COLORS.gold : 'rgba(212,175,55,0.25)'}`,
                    background: isActive ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.55)',
                    boxShadow: isActive
                      ? `0 0 22px rgba(212,175,55,0.35)`
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    opacity: dimmed ? 0.35 : 1,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div className="flex items-center gap-[clamp(8px,1vw,14px)]">
                    <div
                      className="flex-shrink-0 rounded-md flex items-center justify-center"
                      style={{
                        width: 'clamp(44px,3.8vw,60px)',
                        height: 'clamp(44px,3.8vw,60px)',
                        background: 'rgba(212,175,55,0.10)',
                        border: '1px solid rgba(212,175,55,0.3)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={COLORS.gold}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: '55%', height: '55%' }}
                      >
                        {HeritageIcons[i]}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-display text-[clamp(0.85rem,1.05vw,1.15rem)] tracking-wider uppercase truncate"
                        style={{ color: COLORS.gold }}
                      >
                        {pair.heritage.name} ({pair.heritage.year})
                      </p>
                      <p
                        className="text-[clamp(0.7rem,0.85vw,0.95rem)] tracking-wide mt-0.5 truncate"
                        style={{ color: 'rgba(60,60,70,0.65)' }}
                      >
                        Promise: {pair.heritage.promise}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CENTER — DNA Spine */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{ width: 'clamp(110px,12vw,180px)' }}
        >
          <p
            className="text-center text-[clamp(1rem,1.25vw,1.45rem)] font-display tracking-[0.18em] uppercase mb-[clamp(6px,0.9vh,14px)]"
            style={{ color: COLORS.gold, opacity: 0.7 }}
          >
            DNA Spine
          </p>
          <div ref={spineRef} className="relative flex items-center justify-center w-full">
            <DnaHelix active={phase !== 'idle'} />
          </div>
        </div>

        {/* RIGHT — Luxe Attributes */}
        <div className="flex-1 flex flex-col justify-center">
          <p
            className="text-center text-[clamp(1rem,1.25vw,1.45rem)] font-display tracking-[0.18em] uppercase mb-[clamp(6px,0.9vh,14px)]"
            style={{ color: COLORS.gold, opacity: 0.7 }}
          >
            Raheja Luxe Attributes
          </p>
          <div className="flex flex-col gap-[clamp(8px,1.3vh,16px)]">
            {DNA_PAIRS.map((pair, i) => {
              const isMatched = matchedIndex === i
              return (
                <div
                  key={i}
                  ref={(el) => {
                    luxeCardRefs.current[i] = el
                  }}
                  className="rounded-xl p-[clamp(14px,1.6vw,24px)] transition-all duration-500"
                  style={{
                    border: `1px solid ${isMatched ? COLORS.gold : 'rgba(212,175,55,0.25)'}`,
                    background: isMatched
                      ? 'rgba(212,175,55,0.14)'
                      : 'rgba(255,255,255,0.55)',
                    boxShadow: isMatched
                      ? `0 0 32px rgba(212,175,55,0.55)`
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    transform: isMatched ? 'scale(1.03)' : 'scale(1)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div className="flex items-center gap-[clamp(8px,1vw,14px)]">
                    <div
                      className="flex-shrink-0 rounded-md flex items-center justify-center"
                      style={{
                        width: 'clamp(44px,3.8vw,60px)',
                        height: 'clamp(44px,3.8vw,60px)',
                        background: 'rgba(212,175,55,0.10)',
                        border: '1px solid rgba(212,175,55,0.3)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={COLORS.gold}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: '55%', height: '55%' }}
                      >
                        {LuxeIcons[i]}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-display text-[clamp(0.85rem,1.05vw,1.15rem)] tracking-wider uppercase truncate"
                        style={{ color: COLORS.gold }}
                      >
                        {pair.luxe.title}
                      </p>
                      <p
                        className="text-[clamp(0.7rem,0.85vw,0.95rem)] tracking-wide mt-0.5"
                        style={{ color: 'rgba(60,60,70,0.65)' }}
                      >
                        {pair.luxe.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Validated banner */}
      {phase === 'matched' && (
        <div
          className="absolute top-[clamp(16px,2.5vh,32px)] right-[clamp(20px,3vw,40px)] z-30"
          style={{ animation: 'screenFadeIn 0.5s ease-out' }}
        >
          <div
            className="rounded-md border px-[clamp(18px,2vw,36px)] py-[clamp(6px,1vh,14px)]"
            style={{
              borderColor: COLORS.gold,
              background: 'rgba(212,175,55,0.12)',
              boxShadow: `0 0 28px rgba(212,175,55,0.4)`,
            }}
          >
            <p
              className="font-display text-[clamp(1.1rem,1.7vw,1.8rem)] tracking-[0.22em]"
              style={{ color: COLORS.gold }}
            >
              VALIDATED
            </p>
            <p
              className="mt-0.5 text-[clamp(0.6rem,0.75vw,0.85rem)] tracking-[0.2em] uppercase"
              style={{ color: 'rgba(60,60,70,0.5)' }}
            >
              Auto-advancing to climax
            </p>
          </div>
        </div>
      )}

      {/* Hint */}
      {phase === 'idle' && (
        <div className="absolute bottom-[clamp(12px,1.8vh,28px)] left-0 right-0 text-center z-10 pointer-events-none">
          <p
            className="text-[clamp(0.7rem,0.9vw,0.95rem)] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(60,60,70,0.4)' }}
          >
            Drag a heritage anchor through the spine
          </p>
        </div>
      )}
    </div>
  )
}

function DnaHelix({ active }: { active: boolean }) {
  const HEIGHT = 600
  const WIDTH = 80
  const TURNS = 4
  const steps = 100
  const points1: string[] = []
  const points2: string[] = []
  const bars: { y: number; x1: number; x2: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const y = t * HEIGHT
    const ph = t * TURNS * Math.PI * 2
    const a = WIDTH / 2 + Math.sin(ph) * (WIDTH / 2 - 6)
    const b = WIDTH / 2 - Math.sin(ph) * (WIDTH / 2 - 6)
    points1.push(`${a.toFixed(2)},${y.toFixed(2)}`)
    points2.push(`${b.toFixed(2)},${y.toFixed(2)}`)
  }
  for (let i = 0; i < 16; i++) {
    const t = (i + 0.5) / 16
    const y = t * HEIGHT
    const ph = t * TURNS * Math.PI * 2
    const a = WIDTH / 2 + Math.sin(ph) * (WIDTH / 2 - 6)
    const b = WIDTH / 2 - Math.sin(ph) * (WIDTH / 2 - 6)
    bars.push({ y, x1: Math.min(a, b), x2: Math.max(a, b) })
  }
  return (
    <div
      className="relative h-full w-full flex items-center justify-center"
      style={{ filter: active ? 'drop-shadow(0 0 14px rgba(212,175,55,0.6))' : 'none', transition: 'filter 0.4s ease' }}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full"
        style={{ maxHeight: '70vh', width: 'auto' }}
      >
        <defs>
          <linearGradient id="dnaStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.3" />
            <stop offset="50%" stopColor={COLORS.gold} stopOpacity="0.95" />
            <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polyline points={points1.join(' ')} fill="none" stroke="url(#dnaStroke)" strokeWidth="2.5" strokeLinecap="round" />
        <polyline points={points2.join(' ')} fill="none" stroke="url(#dnaStroke)" strokeWidth="2.5" strokeLinecap="round" />
        {bars.map((b, i) => (
          <line
            key={i}
            x1={b.x1}
            y1={b.y}
            x2={b.x2}
            y2={b.y}
            stroke={COLORS.gold}
            strokeWidth="1"
            opacity="0.45"
          />
        ))}
      </svg>
    </div>
  )
}
