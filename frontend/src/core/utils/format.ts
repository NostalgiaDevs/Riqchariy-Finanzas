/** Símbolo del Inti, la moneda del juego. */
export const INTI_SYMBOL = 'ⵊ'

const MINUS = '−' // signo menos tipográfico (U+2212), más legible que el guion

interface FormatIntisOptions {
  /** Decimales máximos. Por defecto 0 (el contrato usa enteros salvo en intereses). */
  decimals?: number
  /** Antepone + a los positivos (para cambios: "+ⵊ28"). */
  signed?: boolean
}

/**
 * Formatea un monto en intis: 1234 → "ⵊ1,234", -40 → "−ⵊ40", 0.56 (decimals 2) → "ⵊ0.56".
 * El signo va antes del símbolo para que "−ⵊ40" no se lea como "ⵊ-40".
 */
export function formatIntis(
  amount: number,
  { decimals = 0, signed = false }: FormatIntisOptions = {},
) {
  const safe = Number.isFinite(amount) ? amount : 0
  const factor = 10 ** decimals
  const rounded = Math.round(Math.abs(safe) * factor) / factor
  const number = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(rounded)

  const sign = rounded === 0 ? '' : safe < 0 ? MINUS : signed ? '+' : ''
  return `${sign}${INTI_SYMBOL}${number}`
}

/** Texto para lectores de pantalla: "135 intis", "menos 40 intis". */
export function intisLabel(amount: number, decimals = 0) {
  const factor = 10 ** decimals
  const rounded = Math.round(Math.abs(amount) * factor) / factor
  const unit = rounded === 1 ? 'inti' : 'intis'
  return `${amount < 0 && rounded !== 0 ? 'menos ' : ''}${rounded} ${unit}`
}

/** 0.25 → "25%" */
export function formatPercent(ratio: number) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0))
  return `${Math.round(clamped * 100)}%`
}
