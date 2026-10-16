import { useParams } from 'react-router'
import { NotFoundPage } from '@/modules/shared/ErrorPages'
import { KioscoGame } from './KioscoGame'
import { LaTrampaGame } from './LaTrampaGame'
import { QoriQuizGame } from './QoriQuizGame'
import { InvierteOPierdeGame } from './InvierteOPierdeGame'
import { MercadoRapidoGame } from './MercadoRapidoGame'

export function GameRoute() {
  const { gameId } = useParams()
  if (gameId === 'kiosco') return <KioscoGame />
  if (gameId === 'la_trampa') return <LaTrampaGame />
  if (gameId === 'qori_quiz') return <QoriQuizGame />
  if (gameId === 'invierte_o_pierde') return <InvierteOPierdeGame />
  if (gameId === 'mercado_rapido') return <MercadoRapidoGame />
  return <NotFoundPage />
}
