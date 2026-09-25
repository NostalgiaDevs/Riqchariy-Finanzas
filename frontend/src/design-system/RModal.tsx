import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/core/utils/cn'

export interface RModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /** false: no se cierra con Esc ni tocando el fondo (para confirmaciones con fricción). */
  dismissible?: boolean
  className?: string
}

/**
 * Modal accesible sobre <dialog> nativo: foco atrapado, Esc y fondo inerte sin librerías.
 * En mobile se muestra como hoja desde abajo; desde 640px, centrado.
 */
export function RModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  className,
}: RModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        // Un clic directo sobre <dialog> (no sobre su contenido) es un clic en el fondo.
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none bg-transparent p-0 text-tinta',
        'sm:inset-0 sm:m-auto sm:max-w-md',
        'backdrop:bg-tinta/50 backdrop:backdrop-blur-[2px]',
      )}
    >
      <div
        className={cn(
          'rounded-t-sheet bg-superficie px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-raised sm:rounded-sheet',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl">
            {title}
          </h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 -mt-2 grid size-touch shrink-0 place-items-center rounded-full text-tinta-suave hover:bg-crema-200"
            >
              <X aria-hidden className="size-5" />
            </button>
          ) : null}
        </div>
        {description ? (
          <div id={descriptionId} className="mt-1 text-tinta-suave">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">{footer}</div>
        ) : null}
      </div>
    </dialog>
  )
}
