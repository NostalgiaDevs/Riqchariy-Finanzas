import { useCallback, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { formatIntis, INTI_SYMBOL } from '@/core/utils/format'
import { IntiFlyContext, type FlyOptions, type FlyTarget } from './useIntiFly'

interface Flight {
  id: number
  from: { x: number; y: number }
  to: { x: number; y: number }
  amount?: number
  coins: number
}

function centerOf(target: FlyTarget) {
  let rect: DOMRect | undefined
  if (typeof target === 'string') {
    rect = document.querySelector(`[data-vital="${target}"]`)?.getBoundingClientRect()
  } else if (target instanceof DOMRect) {
    rect = target
  } else {
    rect = target.getBoundingClientRect()
  }
  if (!rect) return null
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

let nextId = 1
const COIN_SIZE = 28

/** Monedas que vuelan de un punto a otro cuando el dinero se mueve (cobro, ahorro, compra). */
export function IntiFlyProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<Flight[]>([])
  const reducedMotion = useReducedMotion()

  const fly = useCallback(
    ({ from, to, amount, coins = 3 }: FlyOptions) => {
      if (reducedMotion) return
      const start = centerOf(from)
      const end = centerOf(to)
      if (!start || !end) return
      const flight: Flight = {
        id: nextId++,
        from: start,
        to: end,
        amount,
        coins: Math.min(6, Math.max(1, coins)),
      }
      setFlights((current) => [...current, flight])
    },
    [reducedMotion],
  )

  const land = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id))
  }, [])

  return (
    <IntiFlyContext.Provider value={fly}>
      {children}
      {createPortal(
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {flights.map((flight) => (
            <FlightView key={flight.id} flight={flight} onLand={() => land(flight.id)} />
          ))}
        </div>,
        document.body,
      )}
    </IntiFlyContext.Provider>
  )
}

function FlightView({ flight, onLand }: { flight: Flight; onLand: () => void }) {
  const { from, to, coins, amount } = flight
  const half = COIN_SIZE / 2
  // Arco: el punto medio sube por encima del más alto de los dos extremos.
  const peakY = Math.min(from.y, to.y) - 80
  const midX = (from.x + to.x) / 2

  return (
    <>
      {Array.from({ length: coins }, (_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 top-0 grid place-items-center rounded-full border-2 border-dorado-700/40 bg-dorado font-display text-sm font-bold text-tinta shadow-raised"
          style={{ width: COIN_SIZE, height: COIN_SIZE }}
          initial={{ x: from.x - half, y: from.y - half, scale: 0.5, opacity: 0 }}
          animate={{
            x: [from.x - half, midX - half, to.x - half],
            y: [from.y - half, peakY - half, to.y - half],
            scale: [0.5, 1.1, 0.7],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: i * 0.09 }}
          onAnimationComplete={i === coins - 1 ? onLand : undefined}
        >
          {INTI_SYMBOL}
        </motion.div>
      ))}
      {amount !== undefined ? (
        <motion.div
          className="absolute left-0 top-0 rounded-full bg-tinta px-2 py-0.5 text-sm font-semibold tabular-nums text-white"
          initial={{ x: from.x, y: from.y - 36, opacity: 0 }}
          animate={{ y: from.y - 64, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          {formatIntis(amount, { signed: true })}
        </motion.div>
      ) : null}
    </>
  )
}
