import { BrandMark } from '@/components/layout/brand-mark'

export function SiteFooter() {
  return (
    <footer className="border-stone-line bg-parchment border-t py-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:px-10">
        <span className="font-heading text-ink-soft flex items-center gap-2.5 text-sm">
          <BrandMark className="size-6" letterClassName="text-[0.7rem]" />
          El Juego de los Dioses
        </span>
        <p className="text-muted-foreground text-sm">
          Hecho para los dioses y las civilizaciones que los veneran. ¡Que
          comience la guerra!
        </p>
        <span className="bg-azure-dim text-azure rounded-full px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] uppercase">
          En desarrollo activo
        </span>
      </div>
    </footer>
  )
}
