import { create } from 'zustand'
import { Screen } from '../types'

interface AppState {
  currentScreen: Screen
  previousScreen: Screen | null
  isLoading: boolean
  loadingProgress: number
  isMuted: boolean
  selectedMilestoneIndex: number
  videosWatched: number

  setScreen: (screen: Screen) => void
  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  toggleMute: () => void
  setSelectedMilestone: (index: number) => void
  incrementVideosWatched: () => void
  reset: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: Screen.Loading,
  previousScreen: null,
  isLoading: true,
  loadingProgress: 0,
  isMuted: false,
  selectedMilestoneIndex: 0,
  videosWatched: 0,

  setScreen: (screen) =>
    set({ currentScreen: screen, previousScreen: get().currentScreen }),

  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setSelectedMilestone: (index) => set({ selectedMilestoneIndex: index }),
  incrementVideosWatched: () => set((s) => ({ videosWatched: s.videosWatched + 1 })),

  reset: () =>
    set({
      currentScreen: Screen.Standby,
      previousScreen: null,
      selectedMilestoneIndex: 0,
      videosWatched: 0,
    }),
}))
