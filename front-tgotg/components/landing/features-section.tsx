import type { ResourceKey } from '@/types'
import { resources } from '@/data/resources'
import { landingFeatures } from '@/data/landing'
import { Eyebrow } from '@/components/landing/eyebrow'
import { Reveal } from '@/components/landing/reveal'

const resourceAccents: Record<ResourceKey, string> = {
  gold: 'text-gold',
  wood: 'text-wine',
  stone: 'text-stone',
  iron: 'text-azure',
  food: 'text-gold',
}

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <header className="mb-10 max-w-xl">
            <Eyebrow>Características</Eyebrow>
            <h2 className="mt-2 text-3xl leading-tight font-bold lg:text-4xl">
              Todo lo que necesita un reino
            </h2>
            <p className="text-ink-soft mt-3">
              En desarrollo activo: las características se incorporan por etapas
              y la aplicación queda siempre ejecutable.
            </p>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {landingFeatures.map((feature) => (
              <li
                key={feature.title}
                className="border-stone-line bg-marble hover:border-gold hover:shadow-ink/10 rounded-xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <feature.icon
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className={`mb-4 size-9 ${feature.accent}`}
                />
                <h3 className="font-sans text-base font-bold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="border-stone-line mt-12 border-t pt-9 lg:mt-14">
            <h3 className="text-stone mb-5 font-sans text-sm font-bold tracking-[0.1em] uppercase">
              Cinco recursos que gestionar
            </h3>
            <ul className="flex flex-wrap gap-x-9 gap-y-5">
              {Object.values(resources).map((resource) => (
                <li key={resource.key} className="flex items-center gap-2.5">
                  <resource.icon
                    aria-hidden="true"
                    strokeWidth={1.6}
                    className={`size-6 ${resourceAccents[resource.key]}`}
                  />
                  <span className="text-sm font-semibold">
                    {resource.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
