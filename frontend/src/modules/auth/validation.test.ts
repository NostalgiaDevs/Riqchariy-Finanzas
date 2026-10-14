import { describe, expect, it } from 'vitest'
import { validateRegister } from './validation'

const valid = { alias: 'valeria_14', password: 'min8chars', classroom_code: 'RIQCHARIY-DEMO' }

describe('validateRegister', () => {
  it('acepta datos válidos', () => {
    expect(validateRegister(valid)).toEqual({})
  })

  it('rechaza alias muy cortos, largos o con caracteres raros', () => {
    expect(validateRegister({ ...valid, alias: 'ab' }).alias).toBeDefined()
    expect(validateRegister({ ...valid, alias: 'a'.repeat(21) }).alias).toBeDefined()
    expect(validateRegister({ ...valid, alias: 'valeria perez' }).alias).toBeDefined()
  })

  it('exige contraseña de 8+ caracteres y código de aula', () => {
    const errors = validateRegister({ ...valid, password: '1234567', classroom_code: '' })
    expect(errors.password).toBe('Mínimo 8 caracteres.')
    expect(errors.classroom_code).toBeDefined()
  })
})
