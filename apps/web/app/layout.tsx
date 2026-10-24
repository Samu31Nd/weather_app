import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { themeStylesheet } from '@tt/tokens'
import { AppProviders } from '@/components/providers/app-providers'
import { PREFERENCES_BOOT_SCRIPT } from '@/lib/preferences/apply'
import './globals.css'

const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-plex-sans' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' })

export const metadata: Metadata = {
  title: 'Estación meteorológica · ESCOM',
  description: 'Condiciones en vivo e histórico de la estación meteorológica de ESCOM (IPN).',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // `lang`, la clase `dark` y el tamaño de texto los pone el script de arranque antes del primer pintado.
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <style>{themeStylesheet()}</style>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
