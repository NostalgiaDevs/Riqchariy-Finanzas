import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Coins, Sparkles, TriangleAlert } from 'lucide-react'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import type { Vitals } from '@/core/utils/vitals'
import { IntiAmount } from '@/design-system/money/IntiAmount'
import { useIntiFly } from '@/design-system/money/useIntiFly'
import { WalletBar } from '@/design-system/money/WalletBar'
import { HorizonEdge } from '@/design-system/AndeanDawn'
import { Logo } from '@/design-system/Logo'
import { RBadge } from '@/design-system/RBadge'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { RInput } from '@/design-system/RInput'
import { RModal } from '@/design-system/RModal'
import { Skeleton } from '@/design-system/Skeleton'

const PALETTE = [
  ['crema', '#FAF6EF', 'bg-crema border border-crema-300'],
  ['tinta', '#141B2E', 'bg-tinta'],
  ['fucsia', '#D62E6C', 'bg-fucsia'],
  ['dorado', '#F2A81D', 'bg-dorado'],
  ['ahorro', '#2E9E6B', 'bg-ahorro'],
  ['deuda', '#C4472F', 'bg-deuda'],
  ['turquesa', '#2AA8A0', 'bg-turquesa'],
  ['morado', '#7B3FA0', 'bg-morado'],
] as const

/** Tonos de la portada que usan la cabecera y la navegación de la app. */
const DAWN = [
  ['anil', '#2B2154', 'bg-anil'],
  ['cerro', '#3B2C63', 'bg-cerro'],
  ['cerro-oscuro', '#232A4D', 'bg-cerro-oscuro'],
  ['alba', '#EC8A3F', 'bg-alba'],
  ['inti-claro', '#FFD37A', 'bg-inti-claro'],
] as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  )
}

/**
 * Catálogo del design system (/dev/componentes). Sirve para la demo del Sprint 1
 * y para que QA revise componentes sin depender del backend.
 */
export function ComponentCatalog() {
  const [vitals, setVitals] = useState<Vitals>({
    wallet: 135,
    savings: 220,
    debt: 65,
    stress: 0.25,
  })
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const flyFrom = useRef<HTMLButtonElement>(null)
  const fly = useIntiFly()
  useDocumentTitle('Design system')

  const earn = () => {
    setVitals((v) => ({ ...v, wallet: v.wallet + 60 }))
    if (flyFrom.current) fly({ from: flyFrom.current, to: 'wallet', amount: 60 })
  }
  const save = () => {
    if (vitals.wallet < 20) return
    setVitals((v) => ({ ...v, wallet: v.wallet - 20, savings: v.savings + 20 }))
    fly({ from: 'wallet', to: 'savings', amount: 20, coins: 2 })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-gutter py-6 md:max-w-3xl md:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <Link to={paths.app} className="text-sm font-semibold text-fucsia-700 hover:underline">
          Ir a la app
        </Link>
      </header>
      <h1 className="text-3xl">Design system</h1>

      <Section title="VitalBar + IntiFly">
        {/* Así se ve dentro de la app: en la cabecera nocturna, sobre los cerros. */}
        <div className="sticky top-2 z-10 overflow-hidden rounded-sheet shadow-raised">
          <div className="bg-noche-alta px-3 pb-1 pt-3">
            <WalletBar tone="night" vitals={showSkeleton ? null : vitals} />
          </div>
          <HorizonEdge animated={false} />
        </div>
        <p className="text-sm text-tinta-suave">Versión clara (la usa el celular de la portada):</p>
        <WalletBar vitals={showSkeleton ? null : vitals} />
        <div className="grid grid-cols-2 gap-2">
          <RButton ref={flyFrom} icon={<Coins aria-hidden className="size-5" />} onClick={earn}>
            Cobrar ⵊ60
          </RButton>
          <RButton variant="secondary" onClick={save} disabled={vitals.wallet < 20}>
            Ahorrar ⵊ20
          </RButton>
          <RButton
            variant="danger"
            onClick={() => setVitals((v) => ({ ...v, debt: v.debt + 100 }))}
          >
            Pedir préstamo ⵊ100
          </RButton>
          <RButton variant="ghost" onClick={() => setVitals((v) => ({ ...v, debt: 0 }))}>
            Pagar deuda
          </RButton>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Estrés: {Math.round(vitals.stress * 100)}%
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(vitals.stress * 100)}
            onChange={(event) =>
              setVitals((v) => ({ ...v, stress: Number(event.target.value) / 100 }))
            }
            className="h-touch accent-fucsia"
          />
        </label>
        <RButton variant="ghost" onClick={() => setShowSkeleton((v) => !v)}>
          {showSkeleton ? 'Ocultar estado de carga' : 'Ver estado de carga'}
        </RButton>
      </Section>

      <Section title="IntiAmount">
        <RCard className="flex flex-wrap items-center gap-4 text-lg">
          <IntiAmount value={vitals.wallet} />
          <IntiAmount value={-40} />
          <IntiAmount value={28} signed />
          <IntiAmount value={0.56} decimals={2} tone="dorado" />
          <IntiAmount value={1234} tone="neutral" />
        </RCard>
      </Section>

      <Section title="Paleta">
        <div className="grid grid-cols-4 gap-2">
          {PALETTE.map(([name, hex, className]) => (
            <div key={name} className="flex flex-col items-center gap-1 text-xs">
              <span className={`size-12 rounded-control ${className}`} />
              <span className="font-semibold">{name}</span>
              <span className="text-tinta-suave">{hex}</span>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold">Amanecer andino</p>
        <div className="grid grid-cols-5 gap-2">
          {DAWN.map(([name, hex, className]) => (
            <div key={name} className="flex flex-col items-center gap-1 text-center text-xs">
              <span className={`size-12 rounded-control ${className}`} />
              <span className="font-semibold">{name}</span>
              <span className="text-tinta-suave">{hex}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía">
        <RCard className="flex flex-col gap-1">
          <p className="font-display text-3xl font-semibold">Fredoka para títulos</p>
          <p>Inter para la interfaz y el texto de lectura.</p>
          <p className="tabular-nums">Números tabulares: 1,111 · 8,888 · 1,234</p>
        </RCard>
      </Section>

      <Section title="RButton">
        <div className="flex flex-wrap gap-2">
          <RButton>Primary</RButton>
          <RButton variant="secondary">Secondary</RButton>
          <RButton variant="danger">Danger</RButton>
          <RButton variant="ghost">Ghost</RButton>
          <RButton disabled>Disabled</RButton>
          <RButton
            loading={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1500)
            }}
          >
            Con loading
          </RButton>
          <RButton size="lg" fullWidth icon={<Sparkles aria-hidden className="size-5" />}>
            Grande y ancho
          </RButton>
        </div>
      </Section>

      <Section title="RBadge">
        <div className="flex flex-wrap gap-2">
          <RBadge>Neutral</RBadge>
          <RBadge tone="fucsia">Fucsia</RBadge>
          <RBadge tone="dorado">3 cuotas de ⵊ65</RBadge>
          <RBadge tone="ahorro">+ⵊ15</RBadge>
          <RBadge tone="deuda" icon={<TriangleAlert aria-hidden className="size-3" />}>
            Deuda
          </RBadge>
          <RBadge tone="turquesa">Turquesa</RBadge>
          <RBadge tone="morado">🏃 Liga Chaski</RBadge>
        </div>
      </Section>

      <Section title="RCard">
        <div className="grid grid-cols-2 gap-2">
          {(['default', 'fucsia', 'dorado', 'ahorro', 'deuda', 'turquesa'] as const).map((tone) => (
            <RCard key={tone} tone={tone} className="text-sm font-semibold">
              {tone}
            </RCard>
          ))}
        </div>
      </Section>

      <Section title="RInput">
        <RCard className="flex flex-col gap-4">
          <RInput label="Alias" placeholder="valeria_14" hint="Usa un apodo, no tu nombre real." />
          <RInput
            label="Monto"
            inputMode="numeric"
            defaultValue="-5"
            error="El monto debe ser mayor a 0."
          />
        </RCard>
      </Section>

      <Section title="RModal">
        <RButton variant="secondary" onClick={() => setModalOpen(true)}>
          Abrir modal
        </RButton>
        <RModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="¿Seguro?"
          description="Este frasco te protege de emergencias."
          footer={
            <>
              <RButton variant="danger" onClick={() => setModalOpen(false)}>
                Sacar igual
              </RButton>
              <RButton variant="secondary" onClick={() => setModalOpen(false)}>
                Mejor no
              </RButton>
            </>
          }
        >
          <p className="text-sm">
            Si lo vacías, el próximo imprevisto lo pagarás con tu billetera o con deuda.
          </p>
        </RModal>
      </Section>

      <Section title="Skeleton">
        <RCard className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </RCard>
      </Section>
    </div>
  )
}
