import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { milestones } from '../data/milestones'
import { COLORS } from '../utils/constants'
import { clamp } from '../utils/math'
import gsap from 'gsap'

// Responsive card sizing — uses vw but clamped
function getCardWidth() {
  return Math.max(280, Math.min(550, window.innerWidth * 0.3))
}
function getCardGap() {
  return Math.max(30, Math.min(60, window.innerWidth * 0.03))
}

let CARD_WIDTH = getCardWidth()
let CARD_GAP = getCardGap()
let CARD_UNIT = CARD_WIDTH + CARD_GAP

interface TrailPoint {
  x: number
  y: number
  age: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export default function Screen2Timeline() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()

  const [scrollX, setScrollX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const [reachedEnd, setReachedEnd] = useState(false)

  // Recalculate responsive sizes on mount
  useEffect(() => {
    CARD_WIDTH = getCardWidth()
    CARD_GAP = getCardGap()
    CARD_UNIT = CARD_WIDTH + CARD_GAP
  }, [])

  const dragStartRef = useRef(0)
  const scrollStartRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const lastCardIndexRef = useRef(0)
  const dragSoundThrottleRef = useRef(0)

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<TrailPoint[]>([])
  const particlesRef = useRef<Particle[]>([])
  const fingerPosRef = useRef<{ x: number; y: number } | null>(null)
  const animFrameRef = useRef(0)

  // Ambient background bubbles
  const bubblesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number
    size: number; baseSize: number; opacity: number; phase: number
  }>>([])

  // Free-flowing gold thread + particles rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()

    // Initialize ambient bubbles
    if (bubblesRef.current.length === 0) {
      const w = window.innerWidth
      const h = window.innerHeight
      for (let i = 0; i < 80; i++) {
        bubblesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: 3 + Math.random() * 8,
          baseSize: 3 + Math.random() * 8,
          opacity: 0.03 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const trail = trailRef.current
      const particles = particlesRef.current
      const bubbles = bubblesRef.current
      const finger = fingerPosRef.current
      const time = Date.now() * 0.001

      // ---- Draw ambient background bubbles ----
      for (const b of bubbles) {
        // Gentle drift
        b.x += b.vx
        b.y += b.vy

        // Subtle sine wobble
        const wobbleX = Math.sin(time * 0.5 + b.phase) * 0.3
        const wobbleY = Math.cos(time * 0.4 + b.phase * 1.3) * 0.3
        b.x += wobbleX
        b.y += wobbleY

        // Touch/drag interaction — bubbles gently push away
        if (finger) {
          const dx = b.x - finger.x
          const dy = b.y - finger.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200 && dist > 0) {
            const force = (200 - dist) / 200 * 0.8
            b.vx += (dx / dist) * force * 0.15
            b.vy += (dy / dist) * force * 0.15
          }
        }

        // Damping — slowly return to base drift
        b.vx *= 0.995
        b.vy *= 0.995

        // Wrap edges
        if (b.x < -20) b.x = w + 20
        if (b.x > w + 20) b.x = -20
        if (b.y < -20) b.y = h + 20
        if (b.y > h + 20) b.y = -20

        // Pulsing size
        const pulseSize = b.baseSize + Math.sin(time * 0.8 + b.phase) * 1.5

        // Draw bubble — very light gold/gray circle
        ctx.beginPath()
        ctx.arc(b.x, b.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${b.opacity})`
        ctx.fill()

        // Softer outer ring
        ctx.beginPath()
        ctx.arc(b.x, b.y, pulseSize * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${b.opacity * 0.3})`
        ctx.fill()
      }

      // Age out trail points
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 0.02
        if (trail[i].age > 1) trail.splice(i, 1)
      }

      // Draw the free-flowing gold RIBBON from trail points
      if (trail.length > 2) {
        // Helper to draw the smooth path
        function drawTrailPath() {
          ctx.beginPath()
          ctx.moveTo(trail[0].x, trail[0].y)
          for (let i = 1; i < trail.length - 1; i++) {
            const xc = (trail[i].x + trail[i + 1].x) / 2
            const yc = (trail[i].y + trail[i + 1].y) / 2
            ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc)
          }
        }

        const grad = ctx.createLinearGradient(
          trail[0].x, trail[0].y,
          trail[trail.length - 1].x, trail[trail.length - 1].y
        )

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Layer 1: Wide outer glow (soft, 28px)
        drawTrailPath()
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.0)')
        grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.08)')
        grad.addColorStop(1, 'rgba(212, 175, 55, 0.15)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 28
        ctx.stroke()

        // Layer 2: Medium glow (18px)
        drawTrailPath()
        const grad2 = ctx.createLinearGradient(
          trail[0].x, trail[0].y,
          trail[trail.length - 1].x, trail[trail.length - 1].y
        )
        grad2.addColorStop(0, 'rgba(212, 175, 55, 0.0)')
        grad2.addColorStop(0.2, 'rgba(212, 175, 55, 0.15)')
        grad2.addColorStop(1, 'rgba(245, 230, 163, 0.35)')
        ctx.strokeStyle = grad2
        ctx.lineWidth = 18
        ctx.stroke()

        // Layer 3: Core ribbon body (10px, solid gold)
        drawTrailPath()
        const grad3 = ctx.createLinearGradient(
          trail[0].x, trail[0].y,
          trail[trail.length - 1].x, trail[trail.length - 1].y
        )
        grad3.addColorStop(0, 'rgba(212, 175, 55, 0.02)')
        grad3.addColorStop(0.2, 'rgba(212, 175, 55, 0.5)')
        grad3.addColorStop(0.7, 'rgba(245, 230, 163, 0.8)')
        grad3.addColorStop(1, 'rgba(255, 245, 200, 0.95)')
        ctx.strokeStyle = grad3
        ctx.lineWidth = 10
        ctx.shadowColor = 'rgba(212, 175, 55, 0.5)'
        ctx.shadowBlur = 20
        ctx.stroke()
        ctx.shadowBlur = 0

        // Layer 4: Bright center highlight (3px, white-gold)
        drawTrailPath()
        const grad4 = ctx.createLinearGradient(
          trail[0].x, trail[0].y,
          trail[trail.length - 1].x, trail[trail.length - 1].y
        )
        grad4.addColorStop(0, 'rgba(255, 250, 220, 0.0)')
        grad4.addColorStop(0.3, 'rgba(255, 250, 220, 0.3)')
        grad4.addColorStop(1, 'rgba(255, 255, 240, 0.7)')
        ctx.strokeStyle = grad4
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Draw a glowing orb at finger position (matches ribbon width)
      if (finger) {
        // Wide soft glow
        ctx.beginPath()
        ctx.arc(finger.x, finger.y, 35, 0, Math.PI * 2)
        const grd3 = ctx.createRadialGradient(finger.x, finger.y, 0, finger.x, finger.y, 35)
        grd3.addColorStop(0, 'rgba(212, 175, 55, 0.15)')
        grd3.addColorStop(1, 'rgba(212, 175, 55, 0)')
        ctx.fillStyle = grd3
        ctx.fill()

        // Core bright dot
        ctx.beginPath()
        ctx.arc(finger.x, finger.y, 12, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(finger.x, finger.y, 0, finger.x, finger.y, 12)
        grd.addColorStop(0, 'rgba(255, 250, 220, 0.95)')
        grd.addColorStop(0.4, 'rgba(245, 230, 163, 0.7)')
        grd.addColorStop(1, 'rgba(212, 175, 55, 0)')
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.03
        p.vx *= 0.99
        p.life -= 0.016

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const alpha = (p.life / p.maxLife) * 0.8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const spawnParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5 - 0.5,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 1.5,
        size: 1.5 + Math.random() * 3,
      })
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      if (showPrompt) setShowPrompt(false)
      dragStartRef.current = e.clientX
      scrollStartRef.current = scrollX
      lastXRef.current = e.clientX
      lastTimeRef.current = Date.now()
      velocityRef.current = 0
      fingerPosRef.current = { x: e.clientX, y: e.clientY }

      // Start trail
      trailRef.current = [{ x: e.clientX, y: e.clientY, age: 0 }]
      play('metallicShimmer')
    },
    [scrollX, play, showPrompt]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return

      const dx = e.clientX - dragStartRef.current
      // Allow scrolling so the last card can be fully centered on screen
      const maxScroll = (milestones.length - 1) * CARD_UNIT
      const newScroll = clamp(scrollStartRef.current + dx, -maxScroll, 0)
      setScrollX(newScroll)

      // Velocity tracking
      const now = Date.now()
      const dt = now - lastTimeRef.current
      if (dt > 0) {
        velocityRef.current = (e.clientX - lastXRef.current) / dt * 16
      }
      lastXRef.current = e.clientX
      lastTimeRef.current = now

      // Update finger position
      fingerPosRef.current = { x: e.clientX, y: e.clientY }

      // Add to free-flowing trail
      const trail = trailRef.current
      const last = trail[trail.length - 1]
      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 6) {
        trail.push({ x: e.clientX, y: e.clientY, age: 0 })
        // Keep trail max length
        if (trail.length > 120) trail.shift()
      }

      // Spawn particles at finger
      spawnParticles(e.clientX, e.clientY)

      // Play chime when crossing to a new card
      const ci = Math.round(-newScroll / CARD_UNIT)
      if (ci !== lastCardIndexRef.current) {
        lastCardIndexRef.current = ci
        play('waterPing')
      }

      // Play shimmer sound periodically during fast drag
      const now2 = Date.now()
      const speed = Math.abs(velocityRef.current)
      if (speed > 3 && now2 - dragSoundThrottleRef.current > 400) {
        dragSoundThrottleRef.current = now2
        play('harmonicChime')
      }

      if (ci >= 2) {
        setReachedEnd(true)
      }
    },
    [isDragging, spawnParticles]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    fingerPosRef.current = null
    stop('metallicShimmer')

    // Snap to nearest card
    const targetIndex = clamp(Math.round(-scrollX / CARD_UNIT), 0, milestones.length - 1)
    const snappedScroll = -targetIndex * CARD_UNIT

    const obj = { val: scrollX }
    gsap.to(obj, {
      val: snappedScroll,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => setScrollX(obj.val),
    })
    play('chimeSoft')

    // Extra sound if we've reached the last card
    if (targetIndex >= milestones.length - 1) {
      play('celloSwell')
    }
  }, [scrollX, play, stop])

  const handleContinueToConstellation = useCallback(() => {
    play('celloSustain')
    setScreen(Screen.Constellation)
  }, [setScreen, play])

  // Centered card index
  const centeredIndex = clamp(Math.round(-scrollX / CARD_UNIT), 0, milestones.length - 1)
  const centeredMilestone = milestones[centeredIndex]

  return (
    <div
      className="w-full h-full bg-charcoal relative overflow-hidden screen-enter"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background — plain white, no gradient */}

      {/* Free-flowing gold thread + particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Heading — always visible */}
      <div className="absolute top-6 left-0 right-0 text-center z-30 pointer-events-none">
        <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] tracking-wider" style={{ color: COLORS.gold }}>
          Trace the thread to prove our promise.
        </p>
        {/* Subtitle — disappears on first drag */}
        {showPrompt && (
          <p className="mt-2 text-[clamp(0.8rem,1vw,1rem)] text-pearl/40 tracking-wider">
            Drag your finger across the screen
          </p>
        )}
      </div>

      {/* Text ABOVE centered card — Year & Name */}
      <div
        className="absolute left-0 right-0 text-center z-10 pointer-events-none transition-all duration-500"
        style={{ top: 'clamp(50px, 9vh, 100px)' }}
      >
        <div
          className="inline-block"
          key={centeredIndex}
          style={{ animation: 'screenFadeIn 0.4s ease-out' }}
        >
          <p className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold" style={{ color: COLORS.gold }}>
            {centeredMilestone.year}
          </p>
          <p className="mt-1 text-[clamp(1.1rem,2vw,1.6rem)] tracking-wider text-pearl/90">
            {centeredMilestone.name}
          </p>
        </div>
      </div>

      {/* Carousel of cards — 3D coverflow style */}
      <div
        className="absolute top-1/2 left-0"
        style={{
          transform: `translateY(-50%)`,
          willChange: 'transform',
          width: '100%',
          height: CARD_WIDTH * 0.75 + 40,
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {milestones.map((milestone, i) => {
          // Each card is absolutely positioned based on scrollX
          // This avoids flex gap issues at edges
          const exactCenter = -scrollX / CARD_UNIT
          const offset = i - exactCenter // negative = left, positive = right
          const absOffset = Math.abs(offset)

          // Position: each card placed relative to viewport center
          const centerX = window.innerWidth / 2
          const cardX = centerX + offset * CARD_UNIT - CARD_WIDTH / 2

          // Scale: center=1, smooth falloff
          const scale = Math.max(0.6, 1 - absOffset * 0.12)

          // Opacity
          const opacity = Math.max(0.2, 1 - absOffset * 0.22)

          // 3D rotation: cards left of center tilt right (+Y), cards right tilt left (-Y)
          const maxRotate = 50
          const rotateY = clamp(-offset * 35, -maxRotate, maxRotate)

          // Z push: center forward, sides back (symmetrical)
          const translateZ = absOffset < 0.3 ? 30 : -absOffset * 40

          const transitionSpeed = isDragging ? 'none' : 'all 0.4s ease-out'

          return (
            <div
              key={milestone.id}
              className="absolute top-0"
              style={{
                width: CARD_WIDTH,
                left: cardX,
                transform: `rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`,
                opacity,
                transition: transitionSpeed,
                zIndex: 100 - Math.round(absOffset * 10),
                pointerEvents: 'none',
              }}
            >
              <div
                className="w-full aspect-[4/3] rounded-xl overflow-hidden"
                style={{
                  border: absOffset < 0.5
                    ? `2px solid ${COLORS.gold}`
                    : '1px solid rgba(212,175,55,0.15)',
                  boxShadow: absOffset < 0.5
                    ? `0 0 30px rgba(212,175,55,0.3), 0 8px 30px rgba(0,0,0,0.5)`
                    : '0 4px 15px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${milestone.sepiaImage})`,
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    filter: absOffset < 0.5 ? 'sepia(0.3) brightness(0.95)' : 'sepia(0.7) brightness(0.5)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Text BELOW centered card — Stat & Narrative */}
      <div
        className="absolute left-0 right-0 text-center z-10 pointer-events-none transition-all duration-500"
        style={{ bottom: 'clamp(50px, 10vh, 100px)' }}
      >
        <div
          className="inline-block max-w-2xl"
          key={`below-${centeredIndex}`}
          style={{ animation: 'screenFadeIn 0.4s ease-out' }}
        >
          <p className="font-display text-[clamp(1.1rem,1.8vw,1.5rem)] italic" style={{ color: COLORS.pearl }}>
            &ldquo;{centeredMilestone.narrative}&rdquo;
          </p>
          <p className="mt-2 text-[clamp(0.8rem,1.2vw,1.1rem)] tracking-wider" style={{ color: `${COLORS.gold}99` }}>
            {centeredMilestone.stat}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30">
        {milestones.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === centeredIndex ? 28 : 10,
              height: 10,
              backgroundColor: i === centeredIndex ? COLORS.gold : 'rgba(60,60,70,0.15)',
              boxShadow: i === centeredIndex ? `0 0 8px rgba(212,175,55,0.5)` : 'none',
            }}
          />
        ))}
      </div>

      {/* "Continue" arrow at the end */}
      {reachedEnd && (
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 cursor-pointer"
          onClick={handleContinueToConstellation}
          style={{ animation: 'screenFadeIn 0.6s ease-out' }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-[clamp(56px,5vw,80px)] h-[clamp(56px,5vw,80px)] rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: COLORS.gold,
                background: 'rgba(212,175,55,0.1)',
                boxShadow: `0 0 20px rgba(212,175,55,0.3)`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-xs tracking-wider" style={{ color: COLORS.gold }}>
              Continue
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
