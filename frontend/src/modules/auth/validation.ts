export const ALIAS_PATTERN = /^[a-z0-9_]{3,20}$/

export interface RegisterFieldErrors {
  alias?: string
  password?: string
  classroom_code?: string
}

/** Validación del formulario de registro. Recibe valores ya normalizados (alias en minúsculas). */
export function validateRegister(values: {
  alias: string
  password: string
  classroom_code: string
}): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {}
  if (!ALIAS_PATTERN.test(values.alias)) {
    errors.alias = 'De 3 a 20 caracteres: letras, números o _.'
  }
  if (values.password.length < 8) {
    errors.password = 'Mínimo 8 caracteres.'
  }
  if (!values.classroom_code) {
    errors.classroom_code = 'Pídele el código a tu profe.'
  }
  return errors
}
