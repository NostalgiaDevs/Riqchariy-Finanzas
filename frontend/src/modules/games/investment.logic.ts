export const BUCKETS = [
  { id: 'conservador', label: 'Conservador', icon: '🛡️' },
  { id: 'balanceado', label: 'Balanceado', icon: '⚖️' },
  { id: 'arriesgado', label: 'Arriesgado', icon: '📈' },
  { id: 'primo', label: 'Negocio del primo', icon: '🤝' },
] as const
export type BucketId = (typeof BUCKETS)[number]['id']
export type Allocation = Record<BucketId, number>
export const INITIAL_CAPITAL = 100
export const ROUND_FACTORS: Allocation[] = [
  { conservador: 1.02, balanceado: 1.06, arriesgado: 1.14, primo: 1.2 },
  { conservador: 1.02, balanceado: 1.03, arriesgado: 0.91, primo: 1.15 },
  { conservador: 1.01, balanceado: 0.93, arriesgado: 0.55, primo: 0.9 },
  { conservador: 1.02, balanceado: 1.07, arriesgado: 1.2, primo: 1.2 },
  { conservador: 1.02, balanceado: 1.04, arriesgado: 1.1, primo: 0.5 },
  { conservador: 1.02, balanceado: 1.05, arriesgado: 0.96, primo: 0.8 },
]
export function validAllocation(allocation: Allocation, capital: number): boolean {
  return (
    BUCKETS.every(({ id }) => Number.isInteger(allocation[id]) && allocation[id] >= 0) &&
    BUCKETS.reduce((sum, { id }) => sum + allocation[id], 0) === capital
  )
}
const neutralRolls: Allocation = { conservador: 0.5, balanceado: 0.5, arriesgado: 0.5, primo: 0.5 }
export function resolveInvestment(
  allocation: Allocation,
  round: number,
  capital: number,
  rolls: Allocation = neutralRolls,
) {
  const base = ROUND_FACTORS[round]
  if (!base || !validAllocation(allocation, capital)) throw new Error('Distribución inválida')
  const factors = Object.fromEntries(
    BUCKETS.map(({ id }) => {
      const fixed =
        (round === 2 && (id === 'conservador' || id === 'arriesgado')) ||
        (round === 4 && id === 'primo')
      const variation = fixed ? 0 : (Math.min(1, Math.max(0, rolls[id])) - 0.5) * 0.04
      return [id, base[id] + variation]
    }),
  ) as Allocation
  const outcome = Object.fromEntries(
    BUCKETS.map(({ id }) => [id, Math.round(allocation[id] * factors[id])]),
  ) as Allocation
  const total = Object.values(outcome).reduce((a, b) => a + b, 0)
  return { outcome, total, factors }
}
export function singleBucketReturn(id: BucketId, rounds: Allocation[] = ROUND_FACTORS) {
  return rounds.reduce((capital, factors) => Math.round(capital * factors[id]), INITIAL_CAPITAL)
}
