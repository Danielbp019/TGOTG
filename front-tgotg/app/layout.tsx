import type { Metadata } from 'next'
import {
  Cinzel,
  Cinzel_Decorative,
  IBM_Plex_Mono,
  Source_Sans_3,
} from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/components/auth/auth-provider'
import './globals.css'

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
})

const cinzelDecorative = Cinzel_Decorative({
  variable: '--font-cinzel-deco',
  weight: '700',
  subsets: ['latin'],
})

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
})

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  weight: ['500', '600'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'El Juego de los Dioses',
  description:
    'Un juego de estrategia medieval persistente, directamente desde tu navegador. Dirige ciudades, gestiona recursos y demuestra por qué tu civilización merece ser la mejor.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${sourceSans.variable} ${plexMono.variable}`}
    >
      <body>
        <TooltipProvider>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
