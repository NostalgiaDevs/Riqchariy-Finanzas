import { cn } from '@/core/utils/cn'

const MIN = 300
const MAX = 850

/**
 * Zonas del credit score. El corte de 500 sale de balance.yaml (credit.bank.min_score):
 * por debajo el banco no presta y solo queda el prestamista.
 */
const ZONES = [
  { from: 300, to: 500, label: 'Bajo', stroke: 'var(--color-deuda)', text: 'text-deuda-700' },
  { from: 500, to: 650, label: 'Regular', stroke: 'var(--color-dorado)', text: 'text-dorado-700' },
  {
    from: 650,
    to: 750,
    label: 'Bueno',
    stroke: 'var(--color-turquesa)',
    text: 'text-turquesa-700',
  },
  {
    from: 750,
    to: 850,
    label: 'Excelente',
    stroke: 'var(--color-ahorro)',
    text: 'text-ahorro-700',
  },
] as const

function creditZone(score: number) {
  return ZONES.find((zone) => score < zone.to) ?? ZONES[ZONES.length - 1]!
}

// Semicírculo de izquierda (300) a derecha (850), centro en (100, 100), radio 80.
const point = (value: number) => {
  const t = (Math.min(MAX, Math.max(MIN, value)) - MIN) / (MAX - MIN)
  const angle = Math.PI * (1 - t)
  return { x: 100 + 80 * Math.cos(angle), y: 100 - 80 * Math.sin(angle) }
}

const arc = (from: number, to: number) => {
  const a = point(from)
  const b = point(to)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A 80 80 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

/**
 * CreditScoreGauge (S2.FE.02, adelantado para el Perfil): medidor 300–850 con color por zona.
 * La zona también se escribe con palabras: el color nunca es la única pista.
 */
export function CreditScoreGauge({ score, className }: { score: number; className?: string }) {
  const zone = creditZone(score)
  const marker = point(score)

  return (
    <figure
      role="img"
      aria-label={`Credit score ${score} de ${MAX}: ${zone.label.toLowerCase()}.`}
      className={cn('relative mx-auto w-full max-w-64', className)}
    >
      <svg viewBox="0 0 200 112" className="w-full" aria-hidden>
        {ZONES.map((z) => (
          <path
            key={z.label}
            d={arc(z.from + 4, z.to - 4)}
            fill="none"
            stroke={z.stroke}
            strokeWidth={14}
            opacity={z === zone ? 1 : 0.3}
          />
        ))}
        {/* El Inti marca tu puntaje, igual que en la escalera de ligas. */}
        <circle
          cx={marker.x}
          cy={marker.y}
          r={9}
          fill="var(--color-dorado)"
          stroke="var(--color-superficie)"
          strokeWidth={4}
        />
      </svg>
      <div aria-hidden className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-4xl font-semibold leading-none tabular-nums">{score}</p>
        <p className={cn('mt-1 text-sm font-semibold', zone.text)}>{zone.label}</p>
      </div>
    </figure>
  )
}
