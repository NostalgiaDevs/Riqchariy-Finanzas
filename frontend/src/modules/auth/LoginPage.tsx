import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/core/api/endpoints'
import { useAuthStore } from '@/core/store/authStore'
import { USE_MOCKS } from '@/core/utils/env'
import { RButton } from '@/design-system/RButton'
import { RInput } from '@/design-system/RInput'
import { AuthLayout } from './AuthLayout'
import { FormError } from './FormError'
import { PasswordInput } from './PasswordInput'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const [alias, setAlias] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ alias?: string; password?: string }>({})

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        token: data.token,
        user: { player_id: data.player_id, alias: data.alias },
        expiresIn: data.expires_in,
      })
      navigate(from, { replace: true })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanAlias = alias.trim().toLowerCase()
    const errors = {
      alias: cleanAlias ? undefined : 'Escribe tu alias.',
      password: password ? undefined : 'Escribe tu contraseña.',
    }
    setFieldErrors(errors)
    if (errors.alias || errors.password) return
    login.mutate({ alias: cleanAlias, password })
  }

  return (
    <AuthLayout
      title="¡Hola de nuevo!"
      subtitle="Entra para seguir con tu vida financiera."
      footer={
        <>
          ¿Primera vez?{' '}
          <Link
            to="/register"
            className="font-semibold text-fucsia-700 underline-offset-2 hover:underline"
          >
            Crea tu cuenta con el código de tu aula
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
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          error={fieldErrors.alias}
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />

        <FormError message={login.error?.message} />

        <RButton type="submit" size="lg" fullWidth loading={login.isPending}>
          Entrar
        </RButton>

        {USE_MOCKS ? (
          <p className="rounded-control bg-dorado-50 px-3 py-2 text-center text-sm text-dorado-700">
            Modo demo: entra con <strong>alumno1</strong> y <strong>demo1234</strong>
          </p>
        ) : null}
      </form>
    </AuthLayout>
  )
}
