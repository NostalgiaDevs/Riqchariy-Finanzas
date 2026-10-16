import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MercadoRapidoGame } from './MercadoRapidoGame'

vi.mock('./useGameResult', () => ({
  useGameResult: () => ({ mutate: vi.fn(), isPending: false, data: null, isError: false }),
}))

afterEach(() => vi.useRealTimers())

describe('Mercado Rápido', () => {
  it('cancela una investigación iniciada al cambiar de ronda', () => {
    vi.useFakeTimers()
    render(<MercadoRapidoGame />)

    fireEvent.pointerDown(screen.getByRole('button', { name: /Investigar Audífonos/ }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Comprar' })[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Terminar ronda' }))

    act(() => vi.advanceTimersByTime(600))

    expect(screen.getByText('Ronda 2 de 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Investigar Audífonos/ })).toHaveTextContent(
      'Mantén presionado para investigar',
    )
  })

  it('desactiva decisiones cuando vence el tiempo', () => {
    vi.useFakeTimers()
    render(<MercadoRapidoGame />)

    act(() => vi.advanceTimersByTime(30_000))

    expect(screen.getByText('Ronda 2 de 5')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Comprar' })[0]).toBeEnabled()
  })
})
