import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { milestones } from '../data/milestones'
import { COLORS } from '../utils/constants'

interface DragState {
  sourceIndex: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  sourceRect: { x: number; y: number; w: number; h: number }
}

export default function Screen5TrustCompact() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()

  const [drag, setDrag] = useState<DragState | null>(null)
  const [validated, setValidated] = useState(false)
  const [validatedIndex, setValidatedIndex] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const animRef = useRef(0)

  // Canvas for gold thread line + particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      if (drag) {
        const midX = window.innerWidth * 0.375
        const midY = window.innerHeight / 2

        // Bezier gold thread
        ctx.beginPath()
        ctx.moveTo(drag.sourceRect.x + drag.sourceRect.w / 2, drag.sourceRect.y + drag.sourceRect.h / 2)
        ctx.quadraticCurveTo(midX, midY, drag.currentX, drag.currentY)

        const grad = ctx.createLinearGradient(
          drag.sourceRect.x, drag.sourceRect.y,
          drag.currentX, drag.currentY
        )
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.3)')
        grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.8)')
        grad.addColorStop(1, 'rgba(245, 230, 163, 0.9)')

        ctx.strokeStyle = grad
        ctx.lineWidth = 4
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)'
        ctx.shadowBlur = 18
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.shadowBlur = 0

        // Particles
        const steps = 20
        for (let i = 0; i < steps; i++) {
          const t = i / steps
          const sx = drag.sourceRect.x + drag.sourceRect.w / 2
          const sy = drag.sourceRect.y + drag.sourceRect.h / 2
          const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * midX + t * t * drag.currentX
          const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * midY + t * t * drag.currentY

          ctx.beginPath()
          ctx.arc(px + (Math.random() - 0.5) * 8, py + (Math.random() - 0.5) * 8, 1 + Math.random() * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${0.2 + Math.random() * 0.4})`
          ctx.fill()
        }

        // Glow at finger
        ctx.beginPath()
        ctx.arc(drag.currentX, drag.currentY, 12, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(drag.currentX, drag.currentY, 0, drag.currentX, drag.currentY, 12)
        grd.addColorStop(0, 'rgba(245, 230, 163, 0.8)')
        grd.addColorStop(1, 'rgba(212, 175, 55, 0)')
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Validation burst
      if (validated) {
        const cx = window.innerWidth * 0.875
        const cy = window.innerHeight / 2
        const time = Date.now() * 0.003
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2 + time
          const r = 40 + Math.sin(time * 2 + i) * 60
          ctx.beginPath()
          ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 2 + Math.random() * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${0.3 + Math.random() * 0.4})`
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [drag, validated])

  const handleProjectDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (validated) return
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()

      setDrag({
        sourceIndex: index,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        sourceRect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
      })
      play('stringPull')
    },
    [play, validated]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      setDrag({ ...drag, currentX: e.clientX, currentY: e.clientY })
    },
    [drag]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      stop('stringPull')

      const dropZone = dropZoneRef.current
      if (dropZone) {
        const rect = dropZone.getBoundingClientRect()
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          play('validationClick')
          setTimeout(() => play('orchestralSwell'), 200)
          if (navigator.vibrate) navigator.vibrate([100, 50, 200])

          setValidated(true)
          setValidatedIndex(drag.sourceIndex)
          setDrag(null)

          setTimeout(() => setScreen(Screen.LuxeReveal), 3500)
          return
        }
      }

      play('descendingTone')
      setDrag(null)
    },
    [drag, play, stop, setScreen]
  )

  return (
    <div
      className="w-full h-full bg-charcoal relative overflow-hidden screen-enter flex"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: validated
            ? 'radial-gradient(ellipse at 85% 50%, rgba(212,175,55,0.15) 0%, #1A1A1B 60%)'
            : 'radial-gradient(ellipse at 40% 50%, rgba(212,175,55,0.04) 0%, #1A1A1B 70%)',
        }}
      />

      {/* Canvas for gold thread + particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* ===== LEFT 75% — Heading top-left, projects left column, compass center ===== */}
      <div className="relative w-3/4 h-full z-10">

        {/* Heading — top center of the left panel */}
        <div className="absolute top-[3vh] left-0 right-0 text-center z-10">
          {validated ? (
            <div style={{ animation: 'screenFadeIn 0.6s ease-out' }}>
              <p className="font-display text-[clamp(1.5rem,2.5vw,2.2rem)] tracking-wider" style={{ color: COLORS.gold }}>
                VALIDATED
              </p>
              <p className="mt-1 font-display text-[clamp(0.8rem,1.2vw,1.1rem)] text-pearl/70 italic">
                Craftsmanship is our legacy, refined.
              </p>
            </div>
          ) : (
            <>
              <p className="font-display text-[clamp(1.5rem,2.5vw,2.2rem)] tracking-wider" style={{ color: COLORS.gold }}>
                Connect the Past to the Future
              </p>
              <p className="mt-1 text-[clamp(0.7rem,1vw,0.9rem)] text-pearl/40">
                Drag a project to the right to validate
              </p>
            </>
          )}
        </div>

        {/* Project grid — 2 columns on the left side, vertically centered */}
        <div className="absolute left-[2vw] top-1/2 -translate-y-1/2 grid grid-cols-2 gap-[0.8vw]">
          {milestones.map((m, i) => {
            const isValidatedItem = validatedIndex === i
            return (
              <div
                key={m.id}
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  opacity: validated && !isValidatedItem ? 0.3 : 1,
                  transition: 'all 0.5s ease',
                }}
                onPointerDown={(e) => handleProjectDown(e, i)}
              >
                <div
                  className="w-[clamp(120px,14vw,220px)] aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-300"
                  style={{
                    borderColor: isValidatedItem
                      ? COLORS.gold
                      : drag?.sourceIndex === i
                        ? COLORS.goldLight
                        : 'rgba(212,175,55,0.15)',
                    boxShadow: isValidatedItem
                      ? `0 0 20px rgba(212,175,55,0.4)`
                      : drag?.sourceIndex === i
                        ? `0 0 15px rgba(212,175,55,0.3)`
                        : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${m.sepiaImage})`,
                      backgroundColor: 'rgba(212,175,55,0.08)',
                      filter: 'sepia(0.5) brightness(0.7)',
                    }}
                  />
                </div>
                <p className="mt-0.5 text-[clamp(8px,0.6vw,11px)] text-pearl/50 text-center truncate">
                  {m.year} — {m.name}
                </p>
              </div>
            )
          })}
        </div>

        {/* Compass Rose — centered on the full screen horizontally */}
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15"
        >
          <svg
            className="w-[clamp(60px,6vw,100px)] h-[clamp(60px,6vw,100px)]"
            viewBox="0 0 80 80" fill="none"
            style={{
              animation: 'spin 20s linear infinite',
            }}
          >
            <path d="M40 0 L45 35 L80 40 L45 45 L40 80 L35 45 L0 40 L35 35 Z" fill="none" stroke={COLORS.gold} strokeWidth="1" opacity="0.3" />
            <path d="M40 10 L43 35 L70 40 L43 45 L40 70 L37 45 L10 40 L37 35 Z" fill="none" stroke={COLORS.gold} strokeWidth="0.5" opacity="0.2" />
            <circle cx="40" cy="40" r="5" fill={COLORS.gold} opacity="0.25" />
            <circle cx="40" cy="40" r="2" fill={COLORS.gold} opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-[10%] bottom-[10%] z-10"
        style={{
          left: '75%',
          width: '1px',
          background: `linear-gradient(to bottom, transparent, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.15) 70%, transparent)`,
        }}
      />

      {/* ===== RIGHT 25% — Drop zone ===== */}
      <div
        ref={dropZoneRef}
        className="relative w-1/4 h-full flex flex-col items-center justify-center z-10 transition-all duration-500"
        style={{
          background: validated
            ? 'rgba(212,175,55,0.06)'
            : drag
              ? 'rgba(212,175,55,0.03)'
              : 'transparent',
        }}
      >
        {validated && validatedIndex !== null ? (
          <div className="text-center px-4" style={{ animation: 'screenFadeIn 0.5s ease-out' }}>
            <div
              className="w-[12vw] max-w-[180px] aspect-[4/3] rounded-lg overflow-hidden border-2 mx-auto"
              style={{ borderColor: COLORS.gold, boxShadow: `0 0 20px rgba(212,175,55,0.4)` }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${milestones[validatedIndex].modernImage})`,
                  backgroundColor: 'rgba(212,175,55,0.1)',
                }}
              />
            </div>
            <p className="mt-4 font-display text-[clamp(1rem,1.2vw,1.25rem)]" style={{ color: COLORS.gold }}>
              {milestones[validatedIndex].name}
            </p>
            <p className="mt-1 text-[clamp(0.75rem,0.9vw,1rem)] text-pearl/60">
              {milestones[validatedIndex].year}
            </p>
            <div className="mt-3 flex items-center gap-2 justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={COLORS.gold}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-xs tracking-wider" style={{ color: COLORS.gold }}>
                Trust Validated
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-4">
            {/* Crosshair / Aim icon */}
            <div
              className="w-[5vw] max-w-[80px] min-w-[50px] aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-300"
              style={{
                borderColor: drag ? COLORS.gold : 'rgba(212,175,55,0.25)',
                background: drag ? 'rgba(212,175,55,0.1)' : 'transparent',
                boxShadow: drag ? `0 0 25px rgba(212,175,55,0.2)` : 'none',
              }}
            >
              <svg
                width="60%" height="60%" viewBox="0 0 24 24" fill="none"
                stroke={drag ? COLORS.gold : 'rgba(212,175,55,0.35)'}
                strokeWidth="1.5" strokeLinecap="round"
                className="transition-colors duration-300"
              >
                {/* Crosshair */}
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </div>

            <p
              className="mt-4 text-[clamp(0.8rem,1.1vw,1rem)] font-display tracking-wide text-center transition-colors duration-300"
              style={{ color: drag ? COLORS.gold : 'rgba(248,249,249,0.35)' }}
            >
              {drag ? 'Drop here to validate' : 'Drag a project here'}
            </p>

            <p
              className="mt-1 text-[clamp(0.6rem,0.7vw,0.75rem)] tracking-wider text-center transition-colors duration-300"
              style={{ color: drag ? `${COLORS.gold}88` : 'rgba(248,249,249,0.15)' }}
            >
              Raheja Luxe
            </p>

            {/* Pulsing border when dragging */}
            {drag && (
              <div
                className="absolute inset-2 rounded-2xl border-2 pointer-events-none"
                style={{
                  borderColor: COLORS.gold,
                  animation: 'breathe 1.5s ease-in-out infinite',
                  opacity: 0.3,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
