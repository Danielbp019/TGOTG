'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/layout/brand-mark'

const navLinks = [
  { href: '#mundo', label: 'El mundo' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#edificios', label: 'Edificios' },
  { href: '#tecnologia', label: 'Tecnología' },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="border-stone-line bg-marble/85 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-10">
        <Link
          href="/login"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <BrandMark />
          <span className="font-heading text-base leading-tight tracking-widest">
            El Juego de los Dioses
            <small className="text-stone mt-0.5 block font-mono text-[0.6rem] font-medium tracking-[0.16em]">
              TGOTG · Reino persistente
            </small>
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft after:bg-gold hover:text-foreground relative py-1.5 text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login#acceso"
            className={buttonVariants({ variant: 'outline' })}
          >
            Iniciar sesión
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Crear civilización
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="border-stone-line text-foreground flex size-10 items-center justify-center rounded-md border md:hidden"
        >
          {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'bg-marble fixed inset-x-0 top-[72px] bottom-0 z-40 flex-col gap-6 overflow-y-auto px-6 py-8 md:hidden',
          open ? 'flex' : 'hidden'
        )}
      >
        <nav
          aria-label="Navegación móvil"
          className="flex flex-col items-start gap-5"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink-soft text-lg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login#acceso"
            onClick={() => setOpen(false)}
            className={buttonVariants({ variant: 'outline' })}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className={buttonVariants()}
          >
            Crear civilización
          </Link>
        </div>
      </div>
    </header>
  )
}
