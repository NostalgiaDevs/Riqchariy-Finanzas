import { usePlayerState } from '@/core/hooks/usePlayerState'

/**
 * Consejos cortos de Qori (mismas ideas que la portada y las FAQ). Cambian con el día del juego,
 * no con cada render: el alumno ve uno nuevo cuando avanza un día.
 */
const TIPS = [
  'Las ofertas “solo hoy” te apuran para que no compares.',
  'Antes de comprar en cuotas, mira cuánto pagarías en total.',
  'Tu frasco de emergencias te protege cuando algo sale mal.',
  'Tu score no sube por tener más plata, sino por cómo la manejas.',
  'Si una app promete duplicar tu plata, desconfía.',
  'Darte un gusto está bien si no rompe tu meta.',
]

/** Tarjeta de Qori al pie del menú lateral (laptop/PC). */
export function QoriTip() {
  const { data: state } = usePlayerState()
  const tip = TIPS[(state?.current_tick ?? 0) % TIPS.length]

  return (
    <aside aria-label="Consejo de Qori" className="rounded-card bg-superficie p-4 shadow-card">
      <p className="flex items-center gap-2 font-display font-semibold">
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-dorado-50 text-lg"
        >
          🦊
        </span>
        Qori dice
      </p>
      <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{tip}</p>
    </aside>
  )
}
