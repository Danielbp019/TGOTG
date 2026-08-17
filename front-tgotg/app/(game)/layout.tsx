import { BlessingDialog } from '@/components/game/blessing-dialog'
import { GameShell } from '@/components/layout/game-shell'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <GameShell>{children}</GameShell>
      <BlessingDialog />
    </>
  )
}
