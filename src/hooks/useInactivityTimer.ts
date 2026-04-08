import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Screen } from '../types'
import { TIMING } from '../utils/constants'

export function useInactivityTimer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentScreen = useAppStore((s) => s.currentScreen)
  const setScreen = useAppStore((s) => s.setScreen)
  const reset = useAppStore((s) => s.reset)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (currentScreen === Screen.Loading || currentScreen === Screen.Standby) return

    timerRef.current = setTimeout(() => {
      reset()
    }, TIMING.inactivityTimeout)
  }, [currentScreen, reset])

  useEffect(() => {
    resetTimer()

    const onActivity = () => resetTimer()
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('pointermove', onActivity)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('pointermove', onActivity)
    }
  }, [resetTimer])

  return { resetTimer }
}
