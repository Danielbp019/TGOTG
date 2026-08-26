import { WorldMap } from '@/components/map/world-map'

export const metadata = {
  title: 'Mapa del mundo — El Juego de los Dioses',
  description:
    'El mapa global de la contienda: regiones, biomas y los bonos que otorga cada tierra.',
}

export default function MapPage() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-xl font-bold">Mapa del mundo</h1>
        <p className="text-muted-foreground text-sm">
          El mundo conocido de la contienda. Cada región alberga tierras con
          dones distintos.
        </p>
      </header>
      <WorldMap />
    </div>
  )
}
