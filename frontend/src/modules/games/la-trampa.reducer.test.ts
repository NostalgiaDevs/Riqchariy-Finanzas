import { describe, expect, it } from 'vitest'
import { CASES, initialTrap, trapReducer } from './la-trampa.reducer'

describe('La Trampa', () => {
  it('puntúa una sola vez por caso y muestra explicación antes de seguir', () => {
    let state = trapReducer(initialTrap, { type: 'answer', trap: true })
    expect(state.correct).toBe(1)
    expect(trapReducer(state, { type: 'answer', trap: true })).toEqual(state)
    state = trapReducer(state, { type: 'next' })
    expect(state.index).toBe(1)
    expect(state.answered).toBe(false)
  })
  it('termina tras todos los casos, incluso con respuestas erradas', () => {
    let state = initialTrap
    for (let i = 0; i < CASES.length; i++) {
      state = trapReducer(state, { type: 'answer', trap: !CASES[i]!.trap })
      state = trapReducer(state, { type: 'next' })
    }
    expect(state.index).toBe(CASES.length)
    expect(state.correct).toBe(0)
  })
})
