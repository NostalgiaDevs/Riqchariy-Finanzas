import { TriangleAlert } from 'lucide-react'

/** Error general de un formulario (ej. el mensaje que devuelve el backend). */
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-control bg-deuda-50 px-3 py-2.5 text-sm font-medium text-deuda-700"
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
