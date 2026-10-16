import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { shopApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { RModal } from '@/design-system/RModal'
import type { PaymentMethod, ShopItem } from '@/types/api'

const CATEGORIES = ['Todos', 'Metas', 'Necesidades', 'Aprendizaje', 'Gustos'] as const
type Category = (typeof CATEGORIES)[number]
const categoryFor = (id: string): Category => {
  if (['laptop', 'celular', 'bicicleta'].includes(id)) return 'Metas'
  if (['mochila', 'candado'].includes(id)) return 'Necesidades'
  if (['libro', 'curso'].includes(id)) return 'Aprendizaje'
  return 'Gustos'
}

export function InstallmentBadge({ item }: { item: ShopItem }) {
  const detail = item.installment_detail
  if (!detail) return null
  const extra = detail.total - item.price
  return (
    <p className="text-sm text-tinta-suave">
      O {detail.months} cuotas de ⵊ{detail.per_month} · total ⵊ{detail.total}
      {extra > 0 && (
        <span className="block font-semibold text-deuda-700">
          ⚠ Pagas ⵊ{extra} más que al contado
        </span>
      )}
    </p>
  )
}

export function ShopPage() {
  useDocumentTitle('Tienda')
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.shopItems,
    queryFn: shopApi.getItems,
  })
  const { data: player } = usePlayerState()
  const [selected, setSelected] = useState<ShopItem | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('contado')
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState<Category>('Todos')
  const buy = useMutation({
    mutationFn: shopApi.buy,
    onSuccess: async (response) => {
      setSelected(null)
      setNotice(
        `¡Compra realizada! Pagaste ⵊ${response.cost}. ${response.payment_method === 'cuotas' ? 'Revisa la deuda pendiente en el Banco.' : ''}`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.playerState }),
        queryClient.invalidateQueries({ queryKey: queryKeys.shopItems }),
      ])
    },
  })
  const owned = new Set(player?.inventory ?? [])
  const dueNow =
    method === 'cuotas' ? (selected?.installment_detail?.per_month ?? 0) : (selected?.price ?? 0)
  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-sheet bg-noche-alta p-5 text-white">
        <p className="text-sm font-semibold text-inti-claro">DECIDE ANTES DE COMPRAR</p>
        <h1 className="mt-1 text-3xl">Tienda de Pacha</h1>
        <p className="mt-2 max-w-xl text-white/80">
          Mira cuánto pagas hoy y cuánto terminarás pagando. Tu billetera:{' '}
          <strong className="text-inti-claro">ⵊ{player?.wallet ?? '…'}</strong>.
        </p>
      </header>
      <p className="text-sm text-tinta-suave">
        Los productos y saldos de esta demo usan datos simulados mientras se conecta el servidor.
      </p>
      {notice && (
        <p role="status" className="rounded-control bg-ahorro-50 p-3 font-semibold text-ahorro-700">
          {notice}
        </p>
      )}
      {isPending && <p role="status">Cargando productos…</p>}
      {isError && (
        <div role="alert">
          <p>No se pudo cargar la tienda.</p>
          <RButton onClick={() => refetch()}>Reintentar</RButton>
        </div>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Filtrar productos por categoría">
        {CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
            className={`min-h-touch rounded-full px-4 text-sm font-semibold ${category === option ? 'bg-noche-alta text-white' : 'border border-crema-300 bg-white text-tinta hover:border-fucsia'}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.items
          .filter((item) => category === 'Todos' || categoryFor(item.id) === category)
          .map((item) => (
            <RCard key={item.id} padding="lg" className="flex flex-col gap-2">
              <span aria-hidden className="text-4xl">
                {item.icon}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-fucsia-700">
                {categoryFor(item.id)}
              </p>
              <h2 className="text-xl">{item.name}</h2>
              <p className="flex-1 text-sm text-tinta-suave">{item.description}</p>
              <p className="font-display text-2xl">
                ⵊ{item.price}{' '}
                <span className="font-sans text-sm font-normal text-tinta-suave">al contado</span>
              </p>
              <InstallmentBadge item={item} />
              <RButton
                disabled={owned.has(item.id)}
                className="mt-2 self-start"
                onClick={() => {
                  setSelected(item)
                  setMethod('contado')
                  setNotice('')
                  buy.reset()
                }}
              >
                {owned.has(item.id) ? 'Ya lo tienes' : 'Ver compra'}
              </RButton>
            </RCard>
          ))}
      </div>
      {data &&
        !data.items.some((item) => category === 'Todos' || categoryFor(item.id) === category) && (
          <p className="rounded-card border border-dashed border-crema-300 bg-white p-5 text-tinta-suave">
            No hay productos en esta categoría esta semana. Prueba con otra.
          </p>
        )}
      <RModal
        open={Boolean(selected)}
        dismissible={!buy.isPending}
        onClose={() => {
          if (buy.isPending) return
          setSelected(null)
          buy.reset()
        }}
        title={selected ? `Comprar ${selected.name}` : 'Comprar'}
        description="Revisa el costo antes de confirmar."
      >
        {selected && (
          <div className="space-y-4">
            <fieldset>
              <legend className="font-semibold">¿Cómo quieres pagar?</legend>
              <div className="mt-2 grid gap-2">
                <label className="flex min-h-touch items-center gap-2 rounded-control border border-crema-300 p-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === 'contado'}
                    disabled={buy.isPending}
                    onChange={() => setMethod('contado')}
                  />{' '}
                  Contado · ⵊ{selected.price} hoy
                </label>
                {selected.installment_detail && (
                  <label className="flex min-h-touch items-center gap-2 rounded-control border border-crema-300 p-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={method === 'cuotas'}
                      disabled={buy.isPending}
                      onChange={() => setMethod('cuotas')}
                    />{' '}
                    Cuotas · ⵊ{selected.installment_detail.per_month} hoy
                  </label>
                )}
              </div>
            </fieldset>
            <div className="rounded-control bg-crema p-4">
              <p>
                Sale hoy: <strong>ⵊ{dueNow}</strong>
              </p>
              <p>
                Tu billetera después:{' '}
                <strong>ⵊ{Math.max(0, (player?.wallet ?? 0) - dueNow)}</strong>
              </p>
              {method === 'cuotas' && selected.installment_detail && (
                <p className="mt-2 text-deuda-700">
                  ⚠ Deuda futura: ⵊ
                  {selected.installment_detail.total - selected.installment_detail.per_month}.
                  Total: ⵊ{selected.installment_detail.total}.
                </p>
              )}
            </div>
            {(player?.wallet ?? 0) < dueNow && (
              <p role="alert" className="text-deuda-700">
                No tienes suficiente en la billetera para este pago.
              </p>
            )}
            {buy.isError && (
              <p role="alert" className="text-deuda-700">
                {buy.error.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <RButton
                variant="secondary"
                disabled={buy.isPending}
                onClick={() => setSelected(null)}
              >
                Volver
              </RButton>
              <RButton
                disabled={(player?.wallet ?? 0) < dueNow}
                loading={buy.isPending}
                onClick={() => buy.mutate({ item_id: selected.id, payment_method: method })}
              >
                Confirmar compra
              </RButton>
            </div>
          </div>
        )}
      </RModal>
    </div>
  )
}
