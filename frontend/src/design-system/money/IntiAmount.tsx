import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/core/utils/cn'
import { formatIntis, intisLabel } from '@/core/utils/format'

/** Duración del conteo cuando cambia el monto. */
const COUNT_MS = 600

export type IntiTone = 'auto' | 'neutral' | 'dorado' | 'ahorro' | 'deuda'

const TONES: Record<Exclude<IntiTone, 'auto'>, string> = {
  neutral: '',
  dorado: 'text-dorado-700',
  ahorro: 'text-ahorro-700',
  deuda: 'text-deuda-700',
}

function toneFor(tone: IntiTone, value: number) {
  if (tone !== 'auto') return TONES[tone]
  if (value > 0) return TONES.ahorro
  if (value < 0) return TONES.deuda
  return TONES.neutral
}

export interface IntiAmountProps {
  value: number
  decimals?: number
  /** Antepone "+" a los positivos (para mostrar cambios). */
  signed?: boolean
  /** auto: verde si es positivo, rojo si es negativo. */
  tone?: IntiTone
  /** Anima el número al cambiar (se desactiva solo con prefers-reduced-motion). */
  animated?: boolean
  className?: string
}

/** Monto en intis con símbolo ⵊ, cifras tabulares y animación cuando el valor cambia. */
export function IntiAmount({
  value,
  decimals = 0,
  signed = false,
  tone = 'auto',
  animated = true,
  className,
}: IntiAmountProps) {
  const reducedMotion = useReducedMotion()
  const numberRef = useRef<HTMLSpanElement>(null)
  /** Último número pintado en pantalla (puede ser un valor intermedio de la animación). */
  const shown = useRef(value)

  // El conteo escribe directo en el DOM: sin re-render por frame, fluido en celulares de gama media.
  // useLayoutEffect evita que se vea un frame con el valor final antes de arrancar la animación.
  useLayoutEffect(() => {
    const element = numberRef.current
    const from = shown.current
    if (!element || from === value) return

    const format = (n: number) => formatIntis(n, { decimals, signed })
    if (!animated || reducedMotion) {
      shown.current = value
      return
    }

    // Conteo con requestAnimationFrame y "rebote" con la Web Animations API: no hace falta cargar
    // el motor de framer-motion para esto (se descarga aparte, solo para IntiFly).
    element.textContent = format(from)
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - start) / COUNT_MS)
      const current = from + (value - from) * (1 - (1 - progress) ** 3) // ease-out
      shown.current = current
      element.textContent = format(current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    })
    const bump = element.animate?.([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], {
      duration: 350,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // pequeño rebote, como el spring anterior
    })
    return () => {
      cancelAnimationFrame(frame)
      bump?.cancel()
    }
  }, [value, decimals, signed, animated, reducedMotion])

  return (
    <span
      className={cn('inline-block font-semibold tabular-nums', toneFor(tone, value), className)}
    >
      <span ref={numberRef} aria-hidden className="inline-block">
        {formatIntis(value, { decimals, signed })}
      </span>
      <span className="sr-only">{intisLabel(value, decimals)}</span>
    </span>
  )
}
