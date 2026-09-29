import { describe, expect, it } from 'vitest'
import { examplePlayerState, freshPlayerState } from '@/mocks/fixtures'
import { LEAGUE_ORDER, LEAGUES, selectVitals, stressLevel } from './vitals'

describe('selectVitals', () => {
  it('suma los 3 frascos como ahorros y lo pendiente de los préstamos como deuda', () => {
    const vitals = selectVitals(examplePlayerState('p1'))
    expect(vitals).toEqual({ wallet: 135, savings: 220, debt: 65, stress: 0.25 })
  })

  it('un alumno nuevo no tiene ahorros ni deuda', () => {
    const vitals = selectVitals(freshPlayerState('p2'))
    expect(vitals.savings).toBe(0)
    expect(vitals.debt).toBe(0)
  })

  it('limita el estrés a 0–1 aunque el backend mande otra cosa', () => {
    const state = { ...freshPlayerState('p3'), stress: 1.3 }
    expect(selectVitals(state).stress).toBe(1)
  })
})

describe('stressLevel', () => {
  it('usa los umbrales de S1.FE.03: > 60% alto, > 80% crítico', () => {
    expect(stressLevel(0.6)).toBe('ok')
    expect(stressLevel(0.61)).toBe('alto')
    expect(stressLevel(0.8)).toBe('alto')
    expect(stressLevel(0.81)).toBe('critico')
  })
})

describe('LEAGUES', () => {
  it('los rangos cubren de 0 a 1000 sin huecos ni solapes (balance.yaml → leagues)', () => {
    const ranges = LEAGUE_ORDER.map((id) => LEAGUES[id])
    expect(ranges[0]!.min).toBe(0)
    expect(ranges.at(-1)!.max).toBe(1000)
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i]!.min).toBe(ranges[i - 1]!.max + 1)
    }
  })
})
