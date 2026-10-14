import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/core/utils/cn'

export interface RInputProps extends ComponentProps<'input'> {
  label: string
  hint?: ReactNode
  error?: string | null
  /** Elemento a la derecha del input (ej. botón de mostrar contraseña). */
  trailing?: ReactNode
}

export function RInput({ label, hint, error, trailing, id, className, ...props }: RInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  // Con error, el error reemplaza a la ayuda: mostrar los dos repetía textos ("Mínimo 8 caracteres." ×2).
  const showHint = Boolean(hint) && !error
  const describedBy = error ? errorId : showHint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-tinta">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'min-h-touch w-full rounded-control border-2 bg-superficie px-3.5 text-base text-tinta',
            // /80 llega a 4.7:1 sobre blanco (con /70 era 3.7:1, bajo AA para el ejemplo del código de aula).
            'placeholder:text-tinta-suave/80 transition-colors focus:outline-none',
            error ? 'border-deuda focus:border-deuda-700' : 'border-crema-300 focus:border-fucsia',
            trailing ? 'pr-12' : null,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>
        ) : null}
      </div>
      {showHint ? (
        <p id={hintId} className="text-sm text-tinta-suave">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-deuda-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
