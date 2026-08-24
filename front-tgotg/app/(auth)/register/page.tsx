import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthTabs } from '@/components/auth/auth-tabs'
import { RegisterForm } from '@/components/auth/register-form'
import { BrandMark } from '@/components/layout/brand-mark'

export const metadata: Metadata = {
  title: 'Crear cuenta — El Juego de los Dioses',
  description:
    'Funda tu civilización en El Juego de los Dioses: elige un nombre digno de ser recordado por los otros dioses.',
}

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <Link
        href="/login"
        className="mx-auto flex items-center gap-2.5 text-center"
      >
        <BrandMark />
        <span className="font-heading text-base leading-tight tracking-widest">
          El Juego de los Dioses
          <small className="text-stone mt-0.5 block font-mono text-[0.6rem] font-medium tracking-[0.16em]">
            TGOTG · Reino persistente
          </small>
        </span>
      </Link>

      <AuthCard>
        <AuthTabs />
        <RegisterForm />
        <p className="text-muted-foreground relative z-10 mt-5 text-center text-sm">
          ¿Ya tienes un reino?{' '}
          <Link
            href="/login"
            className="text-accent-foreground font-semibold hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </AuthCard>
    </main>
  )
}
