import type { EventCard } from '@/types/economy'

// El contrato de /pacha/state entrega IDs, no el contenido de las cartas.
// Catálogo temporal para los tres eventos que expone MSW; reemplazar cuando exista GET /events/:id.
export const eventCatalog: Record<string, EventCard> = {
  'EMR-001': {
    id: 'EMR-001',
    name: 'Un imprevisto de salud',
    icon: '🩹',
    category: 'emergency',
    description:
      'No te sientes bien. Ir a la farmacia cuesta ⵊ40; dejarlo pasar puede aumentar tu estrés.',
    teaches: ['fondo_de_emergencia'],
    choices: [
      { id: 'farmacia', text: 'Ir a la farmacia', preview_label: 'Cuesta ⵊ40' },
      { id: 'aguantar', text: 'Esperar y descansar', preview_label: 'Sin gasto inmediato' },
    ],
  },
  'TMP-001': {
    id: 'TMP-001',
    name: 'Oferta «solo hoy»',
    icon: '👟',
    category: 'temptation',
    description:
      'Las zapatillas que quieres están a ⵊ126. Antes de decidir, mira cuánto te quedará para lo esencial.',
    teaches: ['urgencia_artificial'],
    choices: [
      { id: 'contado', text: 'Comprar al contado', preview_label: 'Cuesta ⵊ126' },
      { id: 'pasar', text: 'Dejarla pasar', preview_label: 'Tu meta sigue en pie' },
    ],
  },
  'OPP-001': {
    id: 'OPP-001',
    name: 'Un turno extra',
    icon: '🧰',
    category: 'opportunity',
    description:
      'Te ofrecen trabajar unas horas más en el kiosco. Puedes ganar ⵊ25, pero también necesitas descansar.',
    teaches: ['capital_humano'],
    choices: [
      { id: 'aceptar', text: 'Aceptar el turno', preview_label: 'Ganas ⵊ25' },
      { id: 'descansar', text: 'Descansar', preview_label: 'Recuperas energía' },
    ],
  },
}
