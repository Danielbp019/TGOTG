import { CityProvider } from '@/components/city/city-provider'
import { BlessingDialog } from '@/components/game/blessing-dialog'
import { CivilizationDialog } from '@/components/game/civilization-dialog'
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
      <BlessingDialog />
      <CivilizationDialog />
    </>
  )
}
