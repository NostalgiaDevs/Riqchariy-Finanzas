export const PRODUCTS = [
  { id: 'agua', name: 'Agua', icon: '💧', cost: 3, suggested: 5, demand: 1 },
  { id: 'fruta', name: 'Fruta', icon: '🍎', cost: 4, suggested: 7, demand: 0.9 },
  { id: 'pan', name: 'Pan', icon: '🥖', cost: 2, suggested: 4, demand: 1 },
  { id: 'jugo', name: 'Jugo', icon: '🧃', cost: 5, suggested: 8, demand: 0.8 },
  { id: 'galleta', name: 'Galleta', icon: '🍪', cost: 3, suggested: 6, demand: 0.85 },
  { id: 'cuaderno', name: 'Cuaderno', icon: '📓', cost: 8, suggested: 12, demand: 0.7 },
] as const
export type ProductId = (typeof PRODUCTS)[number]['id']
export type Phase = 'buy' | 'price' | 'serve' | 'result'
export interface KioscoState {
  phase: Phase
  seconds: number
  stock: Record<ProductId, number>
  prices: Record<ProductId, number>
  spent: number
  earned: number
  sold: number
  served: number
  missed: number
  customer: { product: ProductId; id: number } | null
  nextCustomerId: number
}
export type KioscoAction =
  | { type: 'buy'; id: ProductId }
  | { type: 'remove'; id: ProductId }
  | { type: 'setPrice'; id: ProductId; price: number }
  | { type: 'tick' }
  | { type: 'next' }
  | { type: 'customer'; id: ProductId }
  | { type: 'serve' }
  | { type: 'miss' }

export const initialKiosco = (): KioscoState => ({
  phase: 'buy',
  seconds: 30,
  stock: { agua: 0, fruta: 0, pan: 0, jugo: 0, galleta: 0, cuaderno: 0 },
  prices: { agua: 5, fruta: 7, pan: 4, jugo: 8, galleta: 6, cuaderno: 12 },
  spent: 0,
  earned: 0,
  sold: 0,
  served: 0,
  missed: 0,
  customer: null,
  nextCustomerId: 1,
})
const product = (id: ProductId) => PRODUCTS.find((item) => item.id === id)!
export const demandFor = (id: ProductId, price: number) =>
  Math.max(0.15, Math.min(1, (product(id).demand * product(id).suggested) / price))

/** Sorteo ponderado: subir el precio reduce la probabilidad de que pidan ese producto. */
export function pickCustomer(prices: Record<ProductId, number>, random: number): ProductId {
  const weights = PRODUCTS.map((item) => demandFor(item.id, prices[item.id]))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let target = Math.max(0, Math.min(0.999999, random)) * total
  for (let index = 0; index < PRODUCTS.length; index++) {
    target -= weights[index]!
    if (target < 0) return PRODUCTS[index]!.id
  }
  return PRODUCTS[PRODUCTS.length - 1]!.id
}
export function kioscoReducer(state: KioscoState, action: KioscoAction): KioscoState {
  switch (action.type) {
    case 'buy': {
      const cost = product(action.id).cost
      if (state.phase !== 'buy' || state.spent + cost > 50) return state
      return {
        ...state,
        spent: state.spent + cost,
        stock: { ...state.stock, [action.id]: state.stock[action.id] + 1 },
      }
    }
    case 'remove': {
      const cost = product(action.id).cost
      if (state.phase !== 'buy' || state.stock[action.id] <= 0) return state
      return {
        ...state,
        spent: state.spent - cost,
        stock: { ...state.stock, [action.id]: state.stock[action.id] - 1 },
      }
    }
    case 'setPrice':
      if (state.phase !== 'price') return state
      return {
        ...state,
        prices: {
          ...state.prices,
          [action.id]: Math.min(20, Math.max(1, Math.round(action.price))),
        },
      }
    case 'tick':
      if (state.phase === 'result') return state
      return state.seconds <= 1
        ? kioscoReducer({ ...state, seconds: 0 }, { type: 'next' })
        : { ...state, seconds: state.seconds - 1 }
    case 'next':
      if (state.phase === 'buy') {
        const hasStock = PRODUCTS.some((item) => state.stock[item.id] > 0)
        return { ...state, phase: hasStock ? 'price' : 'result', seconds: hasStock ? 20 : 0 }
      }
      if (state.phase === 'price') return { ...state, phase: 'serve', seconds: 90 }
      if (state.phase === 'serve')
        return {
          ...state,
          phase: 'result',
          seconds: 0,
          missed: state.missed + Number(Boolean(state.customer)),
          customer: null,
        }
      return state
    case 'customer':
      if (state.phase !== 'serve' || state.customer) return state
      return {
        ...state,
        customer: { product: action.id, id: state.nextCustomerId },
        nextCustomerId: state.nextCustomerId + 1,
      }
    case 'serve': {
      if (state.phase !== 'serve' || !state.customer) return state
      const id = state.customer.product
      const available = state.stock[id] > 0
      return {
        ...state,
        stock: available ? { ...state.stock, [id]: state.stock[id] - 1 } : state.stock,
        earned: state.earned + (available ? state.prices[id] : 0),
        sold: state.sold + Number(available),
        served: state.served + 1,
        missed: state.missed + Number(!available),
        customer: null,
      }
    }
    case 'miss':
      if (!state.customer) return state
      return { ...state, missed: state.missed + 1, customer: null }
  }
}
export const kioscoScore = (state: KioscoState) =>
  Math.max(
    0,
    Math.min(
      1000,
      Math.round(
        state.sold * 85 + Math.max(0, state.earned - state.spent) * 12 - state.missed * 25,
      ),
    ),
  )
