import { techStacks } from '@/data/landing'
import { Eyebrow } from '@/components/landing/eyebrow'
import { Reveal } from '@/components/landing/reveal'

export function TechSection() {
  return (
    <section id="tecnologia" className="scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <header>
            <Eyebrow>Tecnología</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold">Construido con</h2>
          </header>
        </Reveal>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {techStacks.map((stack, index) => (
            <Reveal key={stack.name} delay={index * 80}>
              <div className="border-gold border-l-2 pl-4">
                <h3 className="font-sans text-base font-bold">{stack.name}</h3>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {stack.items.map((item) => (
                    <li
                      key={item}
                      className="border-stone-line bg-marble-dim text-ink-soft rounded-md border px-2.5 py-1 font-mono text-xs"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
