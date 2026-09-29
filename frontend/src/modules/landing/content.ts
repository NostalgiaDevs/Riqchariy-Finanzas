// Textos de la portada. Salen de README, PILOTO-2-SEMANAS y balance.yaml:
// si cambia el diseño del juego (sueldo, ligas, juegos), se actualiza aquí.

import { LEAGUES } from '@/core/utils/vitals'
import type { League } from '@/types/economy'

export const CONTACT_EMAIL = 'contacto.riqchariy@gmail.com'

export const NAV_LINKS = [
  { href: '#como-se-juega', label: 'Cómo se juega' },
  { href: '#juegos', label: 'Juegos' },
  { href: '#ligas', label: 'Ligas' },
  { href: '#colegios', label: 'Colegios y familias' },
  { href: '#contacto', label: 'Contacto' },
] as const

/** Una semana de ejemplo, contada como estado de cuenta. Montos coherentes con balance.yaml. */
export interface WeekEntry {
  day: number
  title: string
  detail: string
  /** Cambio en la billetera. */
  change: number
  /** Billetera después del movimiento. */
  balance: number
  kind: 'ingreso' | 'gasto' | 'decision' | 'ahorro'
}

export const WEEK: WeekEntry[] = [
  {
    day: 1,
    title: 'Cobras tu sueldo del kiosco',
    detail: 'Atendiste rápido en El Kiosco, así que cobras la semana completa.',
    change: 60,
    balance: 80,
    kind: 'ingreso',
  },
  {
    day: 3,
    title: 'Pagas comida, celular y pasajes',
    detail: 'Son gastos fijos: llegan aunque no quieras. Tres días, ⵊ6 cada uno.',
    change: -18,
    balance: 62,
    kind: 'gasto',
  },
  {
    day: 4,
    title: 'Oferta flash: zapatillas a ⵊ180, “solo hoy”',
    detail:
      'Antes de decidir ves el costo real: en 3 cuotas pagarías ⵊ195. La dejas pasar y tu meta sigue en pie.',
    change: 0,
    balance: 62,
    kind: 'decision',
  },
  {
    day: 5,
    title: 'Te enfermas y vas a la farmacia',
    detail: 'Cuesta ⵊ40, pero lo cubre tu frasco de emergencias. Tu billetera ni se entera.',
    change: 0,
    balance: 62,
    kind: 'decision',
  },
  {
    day: 7,
    title: 'Guardas ⵊ20 para tu laptop',
    detail: 'Ahorraste con constancia y ninguna crisis te tumbó: tu score financiero sube.',
    change: -20,
    balance: 42,
    kind: 'ahorro',
  },
]

export interface GameInfo {
  name: string
  icon: string
  does: string
  learns: string
}

export const GAMES: GameInfo[] = [
  {
    name: 'El Kiosco',
    icon: '🏪',
    does: 'Compras mercadería, pones precios y atiendes la hora punta antes de que los clientes se vayan. Tu eficiencia define tu sueldo.',
    learns: 'Margen, inventario y flujo de caja',
  },
  {
    name: 'La Trampa',
    icon: '🕸️',
    does: 'Tres deudas crecen cada turno y tu plata no alcanza para todas. Decides a cuál pagarle primero.',
    learns: 'Interés, prioridad de deudas y cómo salir de ellas',
  },
  {
    name: 'Invierte o Pierde',
    icon: '📈',
    does: 'Repartes ⵊ100 entre opciones con distinto riesgo. A mitad de partida llega una crisis… y tu primo te ofrece un negocio “seguro”.',
    learns: 'Riesgo, diversificación y estafas',
  },
  {
    name: 'Mercado Rápido',
    icon: '⏱️',
    does: 'Tienes 30 segundos para comprar barato. Una de las gangas es falsa: si no investigas, pierdes.',
    learns: 'Comparar precios e investigar antes de comprar',
  },
  {
    name: 'Qori Quiz',
    icon: '🦊',
    does: 'Diez dilemas de la vida real, sin respuestas de memoria: cuotas “sin interés”, apps que duplican tu plata, presión de tus amigos.',
    learns: 'Detectar trampas antes de caer',
  },
]

export interface LeagueInfo {
  id: League
  name: string
  icon: string
  range: string
  origin: string
  meaning: string
}

/** Nombre, ícono y rango vienen de LEAGUES (única fuente); aquí solo el texto de la portada. */
function leagueStep(id: League, origin: string, meaning: string): LeagueInfo {
  const { name, icon, min, max } = LEAGUES[id]
  return { id, name, icon, range: `${min} a ${max}`, origin, meaning }
}

export const LEAGUE_STEPS: LeagueInfo[] = [
  leagueStep(
    'chaski',
    'Los mensajeros del Tawantinsuyu.',
    'Recién empiezas y vas corriendo de un pago a otro.',
  ),
  leagueStep(
    'qollqa',
    'Los depósitos donde los incas guardaban para después.',
    'Ya separas una parte de tu sueldo.',
  ),
  leagueStep(
    'amauta',
    'Los sabios y maestros.',
    'Decides mirando el costo real, no el precio de la vitrina.',
  ),
  leagueStep(
    'apu',
    'Los cerros sagrados que protegen los pueblos.',
    'Tu economía aguanta cualquier tormenta.',
  ),
]

/** Componentes del score financiero (balance.yaml → scoring). Suman 1000. */
export const SCORE_PARTS = [
  { label: 'Ahorro constante', points: 250, color: 'bg-ahorro' },
  { label: 'Manejo de deudas', points: 250, color: 'bg-fucsia' },
  { label: 'Aguantar crisis', points: 200, color: 'bg-morado' },
  { label: 'Decidir con información', points: 150, color: 'bg-turquesa' },
  { label: 'Darte gustos sin romper tus metas', points: 100, color: 'bg-dorado' },
] as const

export const FAQS = [
  {
    q: '¿Se usa dinero real?',
    a: 'No. Todo se paga en intis (ⵊ), la moneda del juego. No hay compras, pagos ni anuncios dentro de Riqchariy.',
  },
  {
    q: '¿Cómo entro?',
    a: 'Tu profe te da un código de aula. Con ese código creas tu cuenta usando un alias y una contraseña. No necesitas correo ni tu nombre real.',
  },
  {
    q: '¿Cuánto tiempo toma?',
    a: 'Entre 5 y 10 minutos, dos a cuatro veces por semana, más una sesión guiada en clase. Cada vez que entras puedes avanzar hasta cuatro días en el juego.',
  },
  {
    q: '¿Y si me endeudo demasiado?',
    a: 'Te va a doler en el juego, que es donde conviene equivocarse. Pero siempre hay una forma de salir: la economía está diseñada para que nadie quede atrapado.',
  },
  {
    q: '¿Quién es Qori?',
    a: 'Un zorro andino que te guía. Ve tu situación en el juego y te responde en dos líneas. Solo habla de finanzas y del juego, y nunca da consejos de inversión reales.',
  },
  {
    q: '¿Qué significa Riqchariy?',
    a: '“Despertar”, en quechua. La idea es que despiertes a cómo funciona la plata antes de que te toque manejarla de verdad.',
  },
] as const
