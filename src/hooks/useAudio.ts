import { useCallback } from 'react'
import { AudioManager } from '../audio/AudioManager'
import type { SoundName } from '../audio/AudioManager'
import { useAppStore } from '../store/useAppStore'

export function useAudio() {
  const isMuted = useAppStore((s) => s.isMuted)

  const play = useCallback(
    (name: SoundName) => {
      if (!isMuted) AudioManager.play(name)
    },
    [isMuted]
  )

  const stop = useCallback((name: SoundName) => {
    AudioManager.stop(name)
  }, [])

  const fade = useCallback((name: SoundName, from: number, to: number, duration: number) => {
    AudioManager.fade(name, from, to, duration)
  }, [])

  const stopAll = useCallback(() => {
    AudioManager.stopAll()
  }, [])

  return { play, stop, fade, stopAll }
}
