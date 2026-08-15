import { Card, CardContent } from "@/components/ui/card"

export default function CityPage() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold">Ciudad</h2>
          <p className="max-w-sm text-muted-foreground">
            Aquí se mostrará la representación de la ciudad con Phaser en una
            etapa posterior.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}