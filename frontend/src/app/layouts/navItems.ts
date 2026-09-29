import type { ComponentType, SVGProps } from 'react'
import { Gamepad2, House, Landmark, MessageCircle, ShoppingBag, Target, Trophy } from 'lucide-react'
import { paths } from '../paths'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

/** Las 5 secciones principales: barra inferior (celular/tablet) y menú lateral (laptop/PC). */
export const PRIMARY_NAV: NavItem[] = [
  { to: paths.app, label: 'Inicio', icon: House, end: true },
  { to: paths.bank, label: 'Banco', icon: Landmark },
  { to: paths.games, label: 'Juegos', icon: Gamepad2 },
  { to: paths.ranking, label: 'Ranking', icon: Trophy },
  { to: paths.chatbot, label: 'Qori', icon: MessageCircle },
]

/**
 * No caben en la barra inferior: en celular se llega desde el Home ("Más en Pacha");
 * en laptop/PC van en el menú lateral, debajo de las principales.
 */
export const SECONDARY_NAV: NavItem[] = [
  { to: paths.shop, label: 'Tienda', icon: ShoppingBag },
  { to: paths.missions, label: 'Misiones', icon: Target },
]
