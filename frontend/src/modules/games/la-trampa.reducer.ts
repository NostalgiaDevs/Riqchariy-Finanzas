export const CASES = [
  {
    id: 'codigo',
    title: 'Tu clave por mensaje',
    text: '«Soy del banco. Envíame el código que llegó a tu celular o bloquearé tu cuenta»',
    trap: true,
    clue: 'Un banco nunca te pide el código de seguridad por chat.',
  },
  {
    id: 'cuotas',
    title: 'Oferta en cuotas',
    text: 'Unas zapatillas cuestan ⵊ180 al contado o 3 cuotas de ⵊ65.',
    trap: true,
    clue: 'Tres cuotas de ⵊ65 suman ⵊ195: pagarías ⵊ15 más.',
  },
  {
    id: 'ahorro',
    title: 'Frasco de ahorro',
    text: 'Guardas ⵊ20 cada semana para una meta. Puedes retirarlos cuando lo necesites.',
    trap: false,
    clue: 'Ahorrar de forma constante te acerca a tu meta sin deuda.',
  },
  {
    id: 'urgencia',
    title: 'Solo hoy',
    text: '«Invierte ⵊ50 ahora y duplicarás tu dinero mañana. Últimos 5 minutos»',
    trap: true,
    clue: 'Una ganancia garantizada y urgente es una señal de alerta.',
  },
  {
    id: 'comparar',
    title: 'Comparar precios',
    text: 'Antes de comprar, revisas el precio total en dos tiendas y cuánto te queda para comida.',
    trap: false,
    clue: 'Comparar el costo total y tu presupuesto ayuda a decidir.',
  },
] as const
export type TrapState = {
  index: number
  correct: number
  answered: boolean
  lastCorrect: boolean | null
}
export type TrapAction = { type: 'answer'; trap: boolean } | { type: 'next' }
export const initialTrap: TrapState = { index: 0, correct: 0, answered: false, lastCorrect: null }
export function trapReducer(state: TrapState, action: TrapAction): TrapState {
  if (action.type === 'answer') {
    if (state.answered || state.index >= CASES.length) return state
    const right = action.trap === CASES[state.index]!.trap
    return { ...state, answered: true, lastCorrect: right, correct: state.correct + Number(right) }
  }
  if (!state.answered || state.index >= CASES.length) return state
  return { ...state, index: state.index + 1, answered: false, lastCorrect: null }
}
