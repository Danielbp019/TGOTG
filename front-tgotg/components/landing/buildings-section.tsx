import type { BuildingTagVariant } from '@/data/landing'
import { buildingShowcase } from '@/data/landing'
import { Eyebrow } from '@/components/landing/eyebrow'
import { Reveal } from '@/components/landing/reveal'

const tagStyles: Record<BuildingTagVariant, string> = {
  principal: 'border border-white/25 bg-ink/50 text-[#DCDFEB]',
  defensa: 'bg-stone/25 text-[#D9D6C9]',
  recursos: 'bg-gold/20 text-gold-bright',
  militar: 'bg-wine/30 text-[#E7A9B4]',
  investigacion: 'bg-azure/35 text-[#9FC0F0]',
}

export function BuildingsSection() {
  return (
    <section
      id="edificios"
      className="bg-ink text-marble scroll-mt-20 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <header className="mb-10 max-w-xl">
            <Eyebrow
              className="text-gold-bright"
              lineClassName="bg-gold-bright"
            >
              Edificios
            </Eyebrow>
            <h2 className="text-marble mt-2 text-3xl leading-tight font-bold lg:text-4xl">
              Cada construcción tiene un propósito
            </h2>
            <p className="mt-3 text-[#B7BBCC]">
              Nueve piezas para levantar tu ciudad. El color de cada etiqueta
              identifica su papel en la civilización.
            </p>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <dl className="border-t border-white/10">
            {buildingShowcase.map((building) => (
              <div
                key={building.name}
                className="grid gap-1 border-b border-white/10 py-4 lg:grid-cols-[1.4fr_0.9fr_2.4fr] lg:items-center lg:gap-6"
              >
                <dt className="font-heading tracking-wide">{building.name}</dt>
                <dd className="order-first lg:order-none">
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.68rem] tracking-wider uppercase ${tagStyles[building.variant]}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-current"
                    />
                    {building.tag}
                  </span>
                </dd>
                <dd className="text-sm leading-relaxed text-[#B7BBCC]">
                  {building.description}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
