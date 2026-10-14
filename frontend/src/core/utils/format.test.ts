import { describe, expect, it } from 'vitest'
import { formatIntis, formatPercent, intisLabel } from './format'

describe('formatIntis', () => {
  it('antepone el símbolo ⵊ y separa miles', () => {
    expect(formatIntis(135)).toBe('ⵊ135')
    expect(formatIntis(1234)).toBe('ⵊ1,234')
  })

  it('pone el signo menos antes del símbolo', () => {
    expect(formatIntis(-40)).toBe('−ⵊ40')
  })

  it('muestra "+" solo si se pide (para cambios)', () => {
    expect(formatIntis(28, { signed: true })).toBe('+ⵊ28')
    expect(formatIntis(28)).toBe('ⵊ28')
  })

  it('redondea a enteros por defecto y respeta los decimales pedidos', () => {
    expect(formatIntis(59.6)).toBe('ⵊ60')
    expect(formatIntis(0.56, { decimals: 2 })).toBe('ⵊ0.56')
  })

  it('nunca muestra "−ⵊ0" ni "+ⵊ0"', () => {
    expect(formatIntis(-0.2)).toBe('ⵊ0')
    expect(formatIntis(0, { signed: true })).toBe('ⵊ0')
  })

  it('trata valores no numéricos como 0', () => {
    expect(formatIntis(Number.NaN)).toBe('ⵊ0')
  })
})

describe('intisLabel', () => {
  it('genera texto para lectores de pantalla', () => {
    expect(intisLabel(135)).toBe('135 intis')
    expect(intisLabel(1)).toBe('1 inti')
    expect(intisLabel(-40)).toBe('menos 40 intis')
  })
})

describe('formatPercent', () => {
  it('convierte 0–1 a porcentaje y lo limita a 0–100%', () => {
    expect(formatPercent(0.25)).toBe('25%')
    expect(formatPercent(1.4)).toBe('100%')
    expect(formatPercent(-0.1)).toBe('0%')
  })
})
