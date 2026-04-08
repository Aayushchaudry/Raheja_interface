export const COLORS = {
  gold: '#D4AF37',
  goldLight: '#F5E6A3',
  goldRgb: '212, 175, 55',
  charcoal: '#1A1A1B',
  pearl: '#F8F9F9',
  nightSky: '#0D0D1A',
} as const

export const TIMING = {
  inactivityTimeout: 30_000,
  breathingCycle: 3,
  transitionDuration: 0.8,
  rippleDuration: 0.6,
  dotExpansion: 0.5,
  revealSequence: 8,
  ctaAutoTransition: 5_000,
} as const

export const PARTICLE = {
  count: 200,
  lifetime: 1.5,
  minSize: 2,
  maxSize: 6,
} as const
