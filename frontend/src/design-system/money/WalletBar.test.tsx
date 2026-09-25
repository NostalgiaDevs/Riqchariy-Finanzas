import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WalletBar } from './WalletBar'

describe('WalletBar', () => {
  it('muestra billetera, ahorros, deuda y estrés', () => {
    render(<WalletBar vitals={{ wallet: 135, savings: 220, debt: 65, stress: 0.25 }} />)

    const bar = screen.getByRole('region', { name: 'Tu estado financiero' })
    expect(within(bar).getByText('135 intis')).toBeInTheDocument()
    expect(within(bar).getByText('220 intis')).toBeInTheDocument()
    expect(within(bar).getByText('65 intis')).toBeInTheDocument()
    expect(screen.getByRole('meter', { name: 'Estrés' })).toHaveAttribute(
      'aria-valuetext',
      '25%, tranquilo',
    )
  })

  it('la deuda no depende solo del color: lleva ícono ⚠ y texto', () => {
    const { container } = render(
      <WalletBar vitals={{ wallet: 10, savings: 0, debt: 65, stress: 0.2 }} />,
    )
    const debt = container.querySelector('[data-vital="debt"]')!
    expect(debt.querySelector('svg')).not.toBeNull()
    expect(within(debt as HTMLElement).getByText('Tienes deuda pendiente.')).toBeInTheDocument()
  })

  it('sin deuda no muestra la alerta', () => {
    const { container } = render(
      <WalletBar vitals={{ wallet: 10, savings: 0, debt: 0, stress: 0.2 }} />,
    )
    expect(screen.queryByText('Tienes deuda pendiente.')).not.toBeInTheDocument()
    expect(container.querySelector('[data-vital="debt"] dt svg')).toBeNull()
  })

  it('el estrés > 80% se anuncia como muy alto', () => {
    render(<WalletBar vitals={{ wallet: 0, savings: 0, debt: 0, stress: 0.85 }} />)
    expect(screen.getByRole('meter', { name: 'Estrés' })).toHaveAttribute(
      'aria-valuetext',
      '85%, muy alto',
    )
  })

  it('mientras carga muestra el esqueleto', () => {
    render(<WalletBar vitals={null} />)
    expect(screen.getByLabelText('Cargando tu estado financiero')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })
})
