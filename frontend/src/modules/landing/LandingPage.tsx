import { useEffect, useLayoutEffect } from 'react'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { SkipLink } from '@/design-system/SkipLink'
import { LandingHeader } from './LandingHeader'
import { AudienceSection } from './sections/AudienceSection'
import { ContactSection } from './sections/ContactSection'
import { FaqSection } from './sections/FaqSection'
import { GamesSection } from './sections/GamesSection'
import { Hero } from './sections/Hero'
import { LandingFooter } from './sections/LandingFooter'
import { LeaguesSection } from './sections/LeaguesSection'
import { QoriSection } from './sections/QoriSection'
import { WeekSection } from './sections/WeekSection'

/**
 * Scroll suave para las anclas del menú, solo mientras la portada está en pantalla.
 * Se activa después de que ScrollRestoration la sube al inicio (efecto pasivo, sin animar ese salto)
 * y se apaga antes de que la siguiente pantalla haga lo mismo (limpieza de layout, que corre primero).
 */
function useLandingSmoothScroll() {
  useEffect(() => {
    document.documentElement.dataset.smoothScroll = ''
  }, [])
  useLayoutEffect(
    () => () => {
      delete document.documentElement.dataset.smoothScroll
    },
    [],
  )
}

/** Portada pública: qué es Riqchariy, cómo se juega y cómo entrar. */
export function LandingPage() {
  useDocumentTitle()
  useLandingSmoothScroll()

  return (
    <div className="min-h-dvh bg-crema">
      <SkipLink />
      <LandingHeader />
      <main id="contenido">
        <Hero />
        <WeekSection />
        <GamesSection />
        <QoriSection />
        <LeaguesSection />
        <AudienceSection />
        <FaqSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  )
}
