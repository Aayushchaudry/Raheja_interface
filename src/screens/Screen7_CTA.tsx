import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAudio } from '../hooks/useAudio'
import { Screen } from '../types'
import { COLORS } from '../utils/constants'
import gsap from 'gsap'

export default function Screen7CTA() {
  const reset = useAppStore((s) => s.reset)
  const setScreen = useAppStore((s) => s.setScreen)
  const { play, stop, fade } = useAudio()
  const arrowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Arrow pulse animation
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }

    // Fade out ambient audio
    fade('luxeAmbient', 0.2, 0, 30000)

    // Auto-reset timer is handled by useInactivityTimer globally
    // But also set a hard 30s backup
    const resetTimer = setTimeout(() => {
      stop('luxeAmbient')
      play('fadeExhale')
      reset()
    }, 30000)

    return () => {
      clearTimeout(resetTimer)
      stop('luxeAmbient')
    }
  }, [play, stop, fade, reset])

  return (
    <div className="w-full h-full bg-charcoal relative overflow-hidden screen-enter">
      {/* Close / Reset button — top right */}
      <div
        className="absolute top-[3vh] right-[2vw] z-40 cursor-pointer"
        onPointerDown={() => {
          stop('luxeAmbient')
          play('fadeExhale')
          reset()
        }}
      >
        <div
          className="w-[clamp(40px,3.5vw,52px)] h-[clamp(40px,3.5vw,52px)] rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
          style={{
            borderColor: 'rgba(212,175,55,0.4)',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg
            className="w-[40%] h-[40%]"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.gold}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* Back arrow on left center — same style as constellation NEXT */}
      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
        onPointerDown={() => {
          play('descendingTone')
          setScreen(Screen.LuxeReveal)
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

      {/* Background subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 60% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Right edge light bar */}
      <div className="absolute top-0 right-0 w-1 h-full overflow-hidden z-10">
        <div
          className="w-full h-32 light-bar"
          style={{
            background: `linear-gradient(to bottom, transparent, ${COLORS.gold}, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <div className="flex items-center gap-16">
          {/* Text */}
          <div className="max-w-lg">
            <p
              className="font-display text-4xl leading-snug tracking-wide"
              style={{ color: COLORS.pearl }}
            >
              Your journey continues
              <br />
              with the{' '}
              <span style={{ color: COLORS.gold }} className="text-glow-gold">
                Master Architects
              </span>
              .
            </p>
            <p className="mt-6 text-sm tracking-wider text-pearl/40">
              Proceed to Wall 2 — Coterie of Curators
            </p>
          </div>

          {/* Golden arrow */}
          <div ref={arrowRef} className="flex-shrink-0">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              style={{ filter: `drop-shadow(0 0 20px rgba(212,175,55,0.4))` }}
            >
              <path
                d="M20 50 L70 50 M55 30 L75 50 L55 70"
                stroke={COLORS.gold}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Outer circle */}
              <circle cx="50" cy="50" r="45" stroke={COLORS.gold} strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-xs tracking-widest text-pearl/20">
          Experience will reset momentarily
        </p>
      </div>
    </div>
  )
}
