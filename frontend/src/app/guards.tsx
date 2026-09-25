import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { hasValidSession, useAuthStore } from '@/core/store/authStore'

/** Deja pasar solo con sesión válida; si no, manda a /login recordando a dónde iba. */
export function RequireAuth() {
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const valid = hasValidSession({ token, expiresAt })

  // Token guardado pero vencido: se limpia para no enviarlo al backend.
  useEffect(() => {
    if (token && !valid) logout()
  }, [token, valid, logout])

  if (!valid) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/**
 * Login y registro: si ya hay sesión, no tiene sentido mostrarlos.
 * Respeta el "from" que dejó RequireAuth: al loguearse, este guard re-renderiza antes
 * que el navigate() del formulario, así que debe mandar al mismo destino.
 */
export function GuestOnly() {
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const location = useLocation()
  if (hasValidSession({ token, expiresAt })) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }
  return <Outlet />
}
