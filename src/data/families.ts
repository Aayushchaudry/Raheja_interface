import type { FamilyData } from '../types'
import { asset } from './assetBase.js'

export const families: FamilyData[] = [
  {
    id: 1,
    name: 'The Sharmas',
    quote: 'Three generations under one roof — and still room for more.',
    photo: asset('families/family-1.webp'),
    videoLeft: 'assets/videos/family-1a.mp4',
    videoRight: 'assets/videos/family-1b.mp4',
  },
  {
    id: 2,
    name: 'The Iyers',
    quote: 'Every morning begins with light through the window.',
    photo: asset('families/family-2.webp'),
    videoLeft: 'assets/videos/family-2a.mp4',
    videoRight: 'assets/videos/family-2b.mp4',
  },
  {
    id: 3,
    name: 'The Banerjees',
    quote: 'Our home learned our rhythms before we knew them ourselves.',
    photo: asset('families/family-3.webp'),
    videoLeft: 'assets/videos/family-3a.mp4',
    videoRight: 'assets/videos/family-3b.mp4',
  },
  {
    id: 4,
    name: 'The Sodhis',
    quote: 'Diwali finds its brightest corner here.',
    photo: asset('families/family-4.webp'),
    videoLeft: 'assets/videos/family-4a.mp4',
    videoRight: 'assets/videos/family-4b.mp4',
  },
  {
    id: 5,
    name: 'The Reddys',
    quote: 'Walls of stone, hearts of warmth — that is home.',
    photo: asset('families/family-5.webp'),
    videoLeft: 'assets/videos/family-5a.mp4',
    videoRight: 'assets/videos/family-5b.mp4',
  },
]
