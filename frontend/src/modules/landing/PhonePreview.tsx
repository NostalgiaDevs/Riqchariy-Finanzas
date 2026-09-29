import { TriangleAlert } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { AliasAvatar } from '@/design-system/AliasAvatar'
import { HorizonEdge } from '@/design-system/AndeanDawn'
import { Logo } from '@/design-system/Logo'
import { WalletBar } from '@/design-system/money/WalletBar'

/**
 * Captura "viva" de la app para la portada: la VitalBar es el componente real.
 * Se presenta como imagen (role="img") para que el lector de pantalla no la lea como controles.
 */
export function PhonePreview({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Vista de la app: tu billetera, ahorros, deuda y estrés arriba, y una oferta flash de zapatillas que te muestra cuánto pagarías en cuotas antes de decidir."
      className={cn(
        // overflow-hidden: la cabecera nocturna sigue la curva de la pantalla del celular.
        'relative w-[390px] overflow-hidden rounded-[3rem] border-[12px] border-tinta bg-crema text-tinta shadow-[0_30px_80px_-20px_rgb(0_0_0/0.65)]',
        // Tamaño real de un celular, reducido con zoom: la VitalBar se ve igual que en la app.
        '[zoom:0.78] sm:[zoom:0.85] lg:[zoom:0.88]',
        className,
      )}
    >
      {/* Misma cabecera que la app (GameLayout). Sin Inti: el sol ya está en el amanecer de la portada. */}
      <div aria-hidden className="bg-noche-alta px-4 pb-2 pt-3 text-white">
        <div className="mx-auto h-5 w-24 rounded-full bg-black/70" />
        <div className="flex items-center justify-between px-1 py-2">
          <Logo tone="light" className="origin-left scale-90" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
            <AliasAvatar alias="valeria_14" className="size-6 text-xs" />
            valeria_14
          </span>
        </div>
        <WalletBar tone="night" vitals={{ wallet: 62, savings: 150, debt: 0, stress: 0.22 }} />
      </div>
      <HorizonEdge inti={false} animated={false} className="-mt-px" />

      <div aria-hidden className="flex flex-col gap-3 px-4 pb-6 pt-1">
        <p className="px-1 text-sm text-tinta-suave">Día 4 en Pacha</p>

        <div className="rounded-card bg-superficie p-3 shadow-card">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-fucsia-50 text-xl">
              👟
            </span>
            <div>
              <p className="text-xs font-semibold text-fucsia-700">Oferta flash, solo hoy</p>
              <p className="font-display text-base font-semibold leading-tight">
                Zapatillas a ⵊ180
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div className="rounded-control border-2 border-deuda/40 bg-deuda-50 px-3 py-2">
              <p className="text-sm font-semibold">Comprar en 3 cuotas</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-deuda-700">
                <TriangleAlert className="size-3.5" />
                Pagarías ⵊ195 en total
              </p>
            </div>
            <div className="rounded-control border-2 border-crema-300 px-3 py-2">
              <p className="text-sm font-semibold">Dejarla pasar</p>
              <p className="mt-0.5 text-xs font-medium text-ahorro-700">Tu meta sigue en pie</p>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dorado-50 text-base">
            🦊
          </span>
          <p className="rounded-2xl rounded-bl-sm bg-superficie px-3 py-2 text-xs leading-snug shadow-card">
            Las ofertas “solo hoy” te apuran para que no compares.
          </p>
        </div>
      </div>
    </div>
  )
}
