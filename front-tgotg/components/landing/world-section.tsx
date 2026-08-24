import { worldTenets } from '@/data/landing'
import { Eyebrow } from '@/components/landing/eyebrow'
import { Reveal } from '@/components/landing/reveal'

export function WorldSection() {
  return (
    <section
      id="mundo"
      className="border-stone-line bg-parchment scroll-mt-20 border-y py-16 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <Eyebrow>El mundo</Eyebrow>
          <h2 className="mt-2 mb-6 text-3xl leading-tight font-bold lg:text-4xl">
            Una gran guerra convoca a los dioses menores
          </h2>
          <p className="text-ink-soft">
            <span
              aria-hidden="true"
              className="font-deco text-gold float-left mt-1.5 mr-2 text-7xl leading-none"
            >
              L
            </span>
            os dioses menores de todo el reino han sido llamados a guiar a sus
            civilizaciones y competir por un único título: ser proclamadas la
            mejor civilización. No serás un general en el campo de batalla.
            Serás algo mayor.
          </p>
          <p className="text-ink-soft mt-4">
            El destino de tu civilización descansa sobre ti. ¿Responderás a la
            llamada?
          </p>
        </Reveal>

        <Reveal delay={100}>
          <ul className="grid gap-3">
            {worldTenets.map((tenet) => (
              <li
                key={tenet.mark}
                className="border-stone-line bg-marble hover:border-gold flex gap-3.5 rounded-xl border p-4 transition duration-300 hover:translate-x-1"
              >
                <span className="text-azure pt-0.5 font-mono text-xs font-medium">
                  {tenet.mark}
                </span>
                <div>
                  <b className="block text-sm font-bold">{tenet.title}</b>
                  <span className="text-muted-foreground text-sm">
                    {tenet.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
