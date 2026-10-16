import {
  INITIAL_CAPITAL,
  resolveInvestment,
  type Allocation,
  type BucketId,
} from './investment.logic'

export type InvestmentPoint = { total: number; buckets: Allocation; factors: Allocation }
export type InvestmentState = {
  round: number
  capital: number
  allocation: Allocation
  history: InvestmentPoint[]
  reveal: InvestmentPoint | null
  scam: boolean
}
const emptyAllocation = (): Allocation => ({
  conservador: 0,
  balanceado: 0,
  arriesgado: 0,
  primo: 0,
})
export const initialInvestment: InvestmentState = {
  round: 0,
  capital: INITIAL_CAPITAL,
  allocation: emptyAllocation(),
  history: [],
  reveal: null,
  scam: false,
}
export type InvestmentAction =
  | { type: 'allocate'; bucket: BucketId; amount: number }
  | { type: 'resolve'; rolls: Allocation }
  | { type: 'next' }

export function investmentReducer(
  state: InvestmentState,
  action: InvestmentAction,
): InvestmentState {
  if (action.type === 'allocate') {
    if (state.reveal || state.round >= 6) return state
    return { ...state, allocation: { ...state.allocation, [action.bucket]: action.amount } }
  }
  if (action.type === 'resolve') {
    if (state.reveal || state.round >= 6) return state
    const next = resolveInvestment(state.allocation, state.round, state.capital, action.rolls)
    const point = { total: next.total, buckets: next.outcome, factors: next.factors }
    return {
      ...state,
      capital: next.total,
      reveal: point,
      history: [...state.history, point],
      scam: state.scam || (state.round === 4 && state.allocation.primo > 0),
    }
  }
  if (!state.reveal) return state
  return { ...state, round: state.round + 1, allocation: emptyAllocation(), reveal: null }
}
