import { useParams } from 'react-router'
import { NotFoundPage } from '@/modules/shared/ErrorPages'
import { KioscoGame } from './KioscoGame'
import { LaTrampaGame } from './LaTrampaGame'

export function GameRoute() {
  const { gameId } = useParams()
  if (gameId === 'kiosco') return <KioscoGame />
  if (gameId === 'la_trampa') return <LaTrampaGame />
  return <NotFoundPage />
}
