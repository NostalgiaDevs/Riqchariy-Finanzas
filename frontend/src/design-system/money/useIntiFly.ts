import { createContext, useContext } from 'react'
import type { VitalKey } from './WalletBar'

/** Origen o destino: un elemento, un rectángulo o una sección de la VitalBar ("wallet", "savings"…). */
export type FlyTarget = Element | DOMRect | VitalKey

export interface FlyOptions {
  from: FlyTarget
  to: FlyTarget
  /** Si se indica, una etiqueta "+ⵊ20" acompaña a las monedas. */
  amount?: number
  /** Cantidad de monedas (1–6). */
  coins?: number
}

export const IntiFlyContext = createContext<((options: FlyOptions) => void) | null>(null)

/** Devuelve fly({ from, to, amount }). Requiere IntiFlyProvider (ya está en AppProviders). */
export function useIntiFly() {
  const fly = useContext(IntiFlyContext)
  if (!fly) throw new Error('useIntiFly debe usarse dentro de <IntiFlyProvider>')
  return fly
}
