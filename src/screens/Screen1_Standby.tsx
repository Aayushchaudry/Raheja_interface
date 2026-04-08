import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'
import gsap from 'gsap'

export default function Screen1Standby() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop } = useAudio()
  const orbRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    play('ambientDrone')

    // Breathing orb animation
    if (orbRef.current) {
      tlRef.current = gsap.timeline({ repeat: -1, yoyo: true })
      tlRef.current.to(orbRef.current, {
        scale: 1.2,
        duration: 3,
        ease: 'sine.inOut',
      })
    }

    // Golden lines animation
    if (linesRef.current) {
      const paths = linesRef.current.querySelectorAll('path')
      paths.forEach((path, i) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          delay: i * 0.2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    }

    return () => {
      stop('ambientDrone')
      tlRef.current?.kill()
    }
  }, [play, stop])

  const handleTouch = useCallback(() => {
    play('celloSwell')

    // Expanding circle transition
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        scale: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          stop('ambientDrone')
          setScreen(Screen.Timeline)
        },
      })
    }
  }, [play, stop, setScreen])

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center bg-charcoal screen-enter relative overflow-hidden"
      onPointerDown={handleTouch}
    >
      {/* Golden lines pattern */}
      <svg
        ref={linesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const cx = 960
          const cy = 540
          const len = 600
          const x2 = cx + Math.cos(angle) * len
          const y2 = cy + Math.sin(angle) * len
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x2} ${y2}`}
              stroke={COLORS.gold}
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          )
        })}
      </svg>

      {/* Logo */}
      <div
        className="absolute top-[3vh] left-[3vw] font-display text-[clamp(1rem,2vw,1.5rem)] tracking-widest"
        style={{ color: COLORS.gold }}
      >
        RAHEJA LUXE
      </div>

      {/* Breathing Orb */}
      <div
        ref={orbRef}
        className="w-[clamp(80px,10vw,130px)] h-[clamp(80px,10vw,130px)] rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle, ${COLORS.pearl} 0%, rgba(248,249,249,0.3) 50%, transparent 70%)`,
          boxShadow: `0 0 40px rgba(248,249,249,0.3), 0 0 80px rgba(212,175,55,0.2)`,
          transform: 'scale(0.8)',
        }}
      />

      {/* Center text */}
      <div className="mt-8 text-center breathing">
        <p
          className="font-display text-[clamp(0.9rem,1.5vw,1.25rem)] tracking-wider italic"
          style={{ color: COLORS.pearl }}
        >
          The legacy is in the details.
        </p>
        <p className="mt-2 text-sm tracking-widest" style={{ color: COLORS.gold }}>
          Touch to begin
        </p>
      </div>
    </div>
  )
}
