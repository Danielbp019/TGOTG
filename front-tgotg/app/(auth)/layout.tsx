export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-wide">
            El Juego de los Dioses
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Los dioses eligen a sus campeones. Demuestra que mereces ser el
            mejor.
          </p>
        </header>
        {children}
      </div>
    </div>
  )
}
