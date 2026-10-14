import { describe, expect, it } from 'vitest'
import {
  demandFor,
  initialKiosco,
  kioscoReducer,
  kioscoScore,
  pickCustomer,
} from './kiosco.reducer'

describe('El Kiosco', () => {
  it('respeta el presupuesto y permite quitar una unidad', () => {
    let state = initialKiosco()
    for (let i = 0; i < 7; i++) state = kioscoReducer(state, { type: 'buy', id: 'cuaderno' })
    expect(state.spent).toBe(48)
    expect(state.stock.cuaderno).toBe(6)
    state = kioscoReducer(state, { type: 'remove', id: 'cuaderno' })
    expect(state.spent).toBe(40)
  })
  it('el precio mayor baja la demanda', () => {
    expect(demandFor('agua', 10)).toBeLessThan(demandFor('agua', 5))
    const base = initialKiosco().prices
    expect(pickCustomer(base, 0.16)).toBe('agua')
    expect(pickCustomer({ ...base, agua: 20 }, 0.16)).toBe('fruta')
  })
  it('al acabar cada reloj cambia de fase con el tiempo correcto', () => {
    let state = kioscoReducer(initialKiosco(), { type: 'buy', id: 'agua' })
    state = { ...state, seconds: 1 }
    state = kioscoReducer(state, { type: 'tick' })
    expect([state.phase, state.seconds]).toEqual(['price', 20])
    state = kioscoReducer({ ...state, seconds: 1 }, { type: 'tick' })
    expect([state.phase, state.seconds]).toEqual(['serve', 90])
    state = kioscoReducer({ ...state, seconds: 1 }, { type: 'tick' })
    expect(state.phase).toBe('result')
  })
  it('avanza fases y vende solo stock disponible', () => {
    let state = kioscoReducer(initialKiosco(), { type: 'buy', id: 'agua' })
    state = kioscoReducer(kioscoReducer(state, { type: 'next' }), { type: 'next' })
    state = kioscoReducer(state, { type: 'customer', id: 'agua' })
    state = kioscoReducer(state, { type: 'serve' })
    expect(state.sold).toBe(1)
    expect(state.earned).toBe(5)
    state = kioscoReducer(state, { type: 'customer', id: 'agua' })
    state = kioscoReducer(state, { type: 'serve' })
    expect(state.sold).toBe(1)
    expect(state.missed).toBe(1)
    expect(kioscoScore(state)).toBeGreaterThan(0)
  })
  it('cuenta como perdido el cliente pendiente al cerrar la caja', () => {
    let state = kioscoReducer(initialKiosco(), { type: 'buy', id: 'agua' })
    state = kioscoReducer(kioscoReducer(state, { type: 'next' }), { type: 'next' })
    state = kioscoReducer(state, { type: 'customer', id: 'pan' })
    state = kioscoReducer(state, { type: 'next' })
    expect(state.phase).toBe('result')
    expect(state.missed).toBe(1)
  })
  it('termina directamente si no compró mercadería', () => {
    const state = kioscoReducer(initialKiosco(), { type: 'next' })
    expect(state.phase).toBe('result')
    expect(kioscoScore(state)).toBe(0)
  })
})
