import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { RCard } from '@/design-system/RCard'
import { buttonClasses } from '@/design-system/buttonStyles'

const games = [
  {
    id: 'kiosco',
    icon: '🏪',
    name: 'El Kiosco',
    description: 'Compra, pon precios y atiende a tus clientes.',
    ready: true,
  },
  {
    id: 'la_trampa',
    icon: '🕵️',
    name: 'La Trampa',
    description: 'Detecta estafas y costos ocultos antes de decidir.',
    ready: true,
  },
  {
    id: 'qori_quiz',
    icon: '🦊',
    name: 'Qori Quiz',
    description: 'Pon a prueba lo que sabes de tu dinero.',
    ready: false,
  },
  {
    id: 'invierte_o_pierde',
    icon: '📈',
    name: 'Invierte o Pierde',
    description: 'Aprende a repartir riesgos.',
    ready: false,
  },
  {
    id: 'mercado_rapido',
    icon: '🛒',
    name: 'Mercado Rápido',
    description: 'Compara precios bajo presión.',
    ready: false,
  },
]
export function GamesHub() {
  useDocumentTitle('Juegos')
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-fucsia-700">Aprende jugando</p>
        <h1 className="text-3xl">Juegos de Pacha</h1>
        <p className="mt-1 text-tinta-suave">Cada partida te enseña a tomar mejores decisiones.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((game) => (
          <RCard key={game.id} padding="lg" className="flex flex-col">
            <span aria-hidden className="text-3xl">
              {game.icon}
            </span>
            <h2 className="mt-2 text-xl">{game.name}</h2>
            <p className="mt-1 flex-1 text-sm text-tinta-suave">{game.description}</p>
            {game.ready ? (
              <Link
                className={buttonClasses({ className: 'mt-4 self-start' })}
                to={paths.game(game.id)}
                aria-label={`Jugar ${game.name}`}
              >
                Jugar
              </Link>
            ) : (
              <span className="mt-4 self-start rounded-full bg-crema-200 px-3 py-1 text-sm text-tinta-suave">
                Próximamente
              </span>
            )}
          </RCard>
        ))}
      </div>
    </div>
  )
}
