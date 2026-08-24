import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { heroStats } from '@/data/landing'
import { Reveal } from '@/components/landing/reveal'
import { Eyebrow } from '@/components/landing/eyebrow'

export function HeroCopy() {
  return (
    <Reveal>
      <Eyebrow>Estrategia medieval · Persistente · Navegador</Eyebrow>

      <h1 className="mt-3 text-4xl leading-[1.06] font-bold tracking-wide sm:text-5xl xl:text-6xl">
        Sé el dios que <span className="text-wine">tu civilización</span> merece
      </h1>

      <div
        aria-hidden="true"
        className="animate-draw from-gold to-wine mt-5 h-0.5 w-0 bg-gradient-to-r"
      />

      <p className="text-ink-soft mt-5 max-w-[46ch] text-lg">
        No controlas soldados uno a uno: eres una entidad superior que moldea el
        destino de todo un pueblo.{' '}
        <strong className="text-foreground font-semibold">
          Construye ciudades, gestiona recursos, investiga tecnologías y forja
          un ejército
        </strong>{' '}
        para demostrar a los demás dioses por qué tu civilización merece ser la
        mejor.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/register" className={buttonVariants({ size: 'lg' })}>
          Responder a la llamada
        </Link>
        <Link
          href="#mundo"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Conocer el mundo ↓
        </Link>
      </div>

      <dl className="border-stone-line mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t pt-6">
        {heroStats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dd className="order-first font-mono text-2xl font-semibold">
              {stat.value}
            </dd>
            <dt className="text-stone text-xs tracking-wide">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </Reveal>
  )
}
