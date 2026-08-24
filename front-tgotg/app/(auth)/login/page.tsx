import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthTabs } from '@/components/auth/auth-tabs'
import { LoginForm } from '@/components/auth/login-form'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { BuildingsSection } from '@/components/landing/buildings-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HeroCopy } from '@/components/landing/hero-copy'
import { TechSection } from '@/components/landing/tech-section'
import { WorldSection } from '@/components/landing/world-section'
import { Reveal } from '@/components/landing/reveal'

export const metadata: Metadata = {
  title: 'El Juego de los Dioses — Guía tu civilización a la gloria',
  description:
    'Un juego de estrategia medieval persistente, directamente desde tu navegador. Dirige ciudades, gestiona recursos y demuestra por qué tu civilización merece ser la mejor.',
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="py-12 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-10 lg:grid-cols-[1.05fr_0.9fr] lg:gap-16">
            <HeroCopy />

            <Reveal delay={120}>
              <AuthCard id="acceso" className="scroll-mt-24">
                <AuthTabs />
                <LoginForm />
                <p className="text-muted-foreground relative z-10 mt-5 text-center text-sm">
                  ¿Aún no tienes civilización?{' '}
                  <Link
                    href="/register"
                    className="text-accent-foreground font-semibold hover:underline"
                  >
                    Créala aquí
                  </Link>
                </p>
              </AuthCard>
            </Reveal>
          </div>
        </section>

        <WorldSection />
        <FeaturesSection />
        <BuildingsSection />
        <TechSection />
      </main>

      <SiteFooter />
    </>
  )
}
