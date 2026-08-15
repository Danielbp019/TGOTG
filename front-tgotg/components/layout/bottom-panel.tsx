import { cityProduction, cityStatus, armyStatus } from "@/data/city"
import { resources } from "@/data/resources"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function BottomPanel() {
  return (
    <footer className="grid shrink-0 grid-cols-1 gap-4 border-t bg-card p-4 sm:grid-cols-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Producción</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1">
            {cityProduction.map((production) => {
              const resource = resources[production.resource]
              return (
                <li
                  key={production.resource}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <resource.icon className="size-4 shrink-0" />
                    {production.label}
                  </span>
                  <span className="tabular-nums">+{production.perHour}/h</span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Estado de la ciudad</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Población</span>
              <span className="tabular-nums">{cityStatus.population}</span>
            </div>
            <Progress value={70} aria-label="Población" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Felicidad</span>
              <span className="tabular-nums">{cityStatus.happiness}%</span>
            </div>
            <Progress value={cityStatus.happiness} aria-label="Felicidad" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Defensa</span>
              <span className="tabular-nums">{cityStatus.defense}</span>
            </div>
            <Progress value={cityStatus.defense} aria-label="Defensa" />
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            Ejército
            <Badge variant="secondary">{armyStatus.overall}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tropas estacionadas</dt>
              <dd className="tabular-nums">{armyStatus.stationedTroops}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Fuerza defensiva</dt>
              <dd className="tabular-nums">{armyStatus.defensePower}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Estado general</dt>
              <dd>{armyStatus.overall}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </footer>
  )
}
