import { describe, expect, it } from 'vitest'
import {
  INITIAL_CAPITAL,
  resolveInvestment,
  singleBucketReturn,
  validAllocation,
} from './investment.logic'
import { initialInvestment, investmentReducer } from './investment.reducer'

describe('Invierte o Pierde', () => {
  it('requiere repartir exactamente el capital con enteros no negativos', () => {
    expect(
      validAllocation({ conservador: 40, balanceado: 40, arriesgado: 20, primo: 0 }, 100),
    ).toBe(true)
    expect(
      validAllocation({ conservador: 40, balanceado: 40, arriesgado: 19, primo: 0 }, 100),
    ).toBe(false)
    expect(
      validAllocation({ conservador: -1, balanceado: 101, arriesgado: 0, primo: 0 }, 100),
    ).toBe(false)
  })
  it('la crisis golpea al arriesgado y protege al conservador', () => {
    expect(
      resolveInvestment({ conservador: 0, balanceado: 0, arriesgado: 100, primo: 0 }, 2, 100).total,
    ).toBe(55)
    expect(
      resolveInvestment({ conservador: 100, balanceado: 0, arriesgado: 0, primo: 0 }, 2, 100).total,
    ).toBe(101)
  })
  it('el primo pierde la mitad en la ronda cinco', () => {
    expect(
      resolveInvestment({ conservador: 0, balanceado: 0, arriesgado: 0, primo: 100 }, 4, 100).total,
    ).toBe(50)
  })
  it('permite inyectar resultados variables sin alterar la crisis ni la estafa', () => {
    const low = { conservador: 0, balanceado: 0, arriesgado: 0, primo: 0 }
    const high = { conservador: 1, balanceado: 1, arriesgado: 1, primo: 1 }
    const allRisk = { conservador: 0, balanceado: 0, arriesgado: 100, primo: 0 }
    expect(resolveInvestment(allRisk, 0, 100, low).total).toBeLessThan(
      resolveInvestment(allRisk, 0, 100, high).total,
    )
    expect(resolveInvestment(allRisk, 2, 100, low).total).toBe(
      resolveInvestment(allRisk, 2, 100, high).total,
    )
  })
  it('compara opciones individuales desde el mismo capital inicial', () => {
    expect(singleBucketReturn('conservador')).toBeGreaterThan(INITIAL_CAPITAL)
  })
  it('el reducer avanza una sola vez por ronda y conserva el historial', () => {
    const allocated = investmentReducer(initialInvestment, {
      type: 'allocate',
      bucket: 'conservador',
      amount: 100,
    })
    const rolls = { conservador: 0.5, balanceado: 0.5, arriesgado: 0.5, primo: 0.5 }
    const resolved = investmentReducer(allocated, { type: 'resolve', rolls })
    expect(resolved.capital).toBe(102)
    expect(investmentReducer(resolved, { type: 'resolve', rolls })).toBe(resolved)
    expect(resolveInvestment(allocated.allocation, 0, 100, rolls).total).toBe(resolved.capital)
    const next = investmentReducer(resolved, { type: 'next' })
    expect(next.round).toBe(1)
    expect(next.history).toHaveLength(1)
    expect(next.reveal).toBeNull()
  })
})
