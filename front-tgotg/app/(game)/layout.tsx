import { CityProvider } from '@/components/city/city-provider'
import { OnboardingWizard } from '@/components/game/onboarding-wizard'
import { GameShell } from '@/components/layout/game-shell'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CityProvider>
        <GameShell>{children}</GameShell>
      </CityProvider>
      <OnboardingWizard />
    </>
  )
}
