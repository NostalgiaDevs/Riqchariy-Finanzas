import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { RInput, type RInputProps } from '@/design-system/RInput'

/** RInput de contraseña con botón para mostrarla (útil en celular, donde es fácil equivocarse). */
export function PasswordInput(props: Omit<RInputProps, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false)
  return (
    <RInput
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="grid size-touch place-items-center rounded-full text-tinta-suave hover:bg-crema-200"
        >
          {visible ? (
            <EyeOff aria-hidden className="size-5" />
          ) : (
            <Eye aria-hidden className="size-5" />
          )}
        </button>
      }
    />
  )
}
