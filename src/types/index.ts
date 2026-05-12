export enum Screen {
  Loading = 'loading',
  Standby = 'standby',
  Timeline = 'timeline',
  Milestone = 'milestone',
  Constellation = 'constellation',
  TrustCompact = 'trustCompact',
  LuxeReveal = 'luxeReveal',
  CTA = 'cta',
}

export interface MilestoneData {
  id: number
  year: number | string
  name: string
  sepiaImage: string
  modernImage: string
  stat: string
  narrative: string
}

export interface FamilyData {
  id: number
  name: string
  quote: string
  photo: string
  videoLeft: string
  videoRight: string
}

export interface LegacyItem {
  id: number
  name: string
  year: number | string
  image: string
}

export type TransitionType = 'expandCircle' | 'fadeBlack' | 'slideLeft' | 'none'
