import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">El Juego de los Dioses</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Un juego de estrategia medieval persistente por navegador. La interfaz
        administrativa está construida sobre shadcn/ui y Tailwind CSS.
      </p>
      <div className="flex gap-4">
        <Button>Jugar</Button>
        <Button variant="secondary">Configuración</Button>
      </div>
    </main>
  );
}