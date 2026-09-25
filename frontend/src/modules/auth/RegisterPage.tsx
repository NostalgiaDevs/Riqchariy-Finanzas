import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/core/api/endpoints'
import { useAuthStore } from '@/core/store/authStore'
import { RButton } from '@/design-system/RButton'
import { RInput } from '@/design-system/RInput'
import { AuthLayout } from './AuthLayout'
import { FormError } from './FormError'
import { PasswordInput } from './PasswordInput'
import { validateRegister, type RegisterFieldErrors } from './validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [alias, setAlias] = useState('')
  const [password, setPassword] = useState('')
  const [classroomCode, setClassroomCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // El registro no devuelve expires_in: el backend emite JWT de 24h (S1.BE.02).
      setSession({
        token: data.token,
        user: { player_id: data.player_id, alias: data.alias },
        expiresIn: 86400,
      })
      navigate('/', { replace: true })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = {
      alias: alias.trim().toLowerCase(),
      password,
      classroom_code: classroomCode.trim().toUpperCase(),
    }
    const errors = validateRegister(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    register.mutate(values)
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Tu profe te dio un código de aula. Con eso basta."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-fucsia-700 underline-offset-2 hover:underline"
          >
            Entra aquí
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <RInput
          label="Alias"
          name="alias"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          hint="Usa un apodo, no tu nombre real."
          error={fieldErrors.alias}
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Mínimo 8 caracteres."
          error={fieldErrors.password}
        />
        <RInput
          label="Código de aula"
          name="classroom_code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="RIQCHARIY-DEMO"
          value={classroomCode}
          onChange={(event) => setClassroomCode(event.target.value)}
          error={fieldErrors.classroom_code}
        />

        <FormError message={register.error?.message} />

        <RButton type="submit" size="lg" fullWidth loading={register.isPending}>
          Empezar
        </RButton>
      </form>
    </AuthLayout>
  )
}
