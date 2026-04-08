import { useAppStore } from './store/useAppStore'
import { useInactivityTimer } from './hooks/useInactivityTimer'
import { Screen } from './types'
import BackButton from './components/BackButton'
import LoadingScreen from './screens/LoadingScreen'
import Screen1Standby from './screens/Screen1_Standby'
import Screen2Timeline from './screens/Screen2_Timeline'
import Screen3Milestone from './screens/Screen3_Milestone'
import Screen4Constellation from './screens/Screen4_Constellation'
import Screen5TrustCompact from './screens/Screen5_TrustCompact'
import Screen6LuxeReveal from './screens/Screen6_LuxeReveal'
import Screen7CTA from './screens/Screen7_CTA'

function App() {
  const currentScreen = useAppStore((s) => s.currentScreen)
  useInactivityTimer()

  const showBack = currentScreen !== Screen.Loading
    && currentScreen !== Screen.Standby
    && currentScreen !== Screen.Timeline
    && currentScreen !== Screen.Constellation
    && currentScreen !== Screen.CTA

  return (
    <div className="w-full h-full relative overflow-hidden bg-charcoal">
      {currentScreen === Screen.Loading && <LoadingScreen />}
      {currentScreen === Screen.Standby && <Screen1Standby />}
      {currentScreen === Screen.Timeline && <Screen2Timeline />}
      {currentScreen === Screen.Milestone && <Screen3Milestone />}
      {currentScreen === Screen.Constellation && <Screen4Constellation />}
      {currentScreen === Screen.TrustCompact && <Screen5TrustCompact />}
      {currentScreen === Screen.LuxeReveal && <Screen6LuxeReveal />}
      {currentScreen === Screen.CTA && <Screen7CTA />}
      {showBack && <BackButton />}
    </div>
  )
}

export default App
