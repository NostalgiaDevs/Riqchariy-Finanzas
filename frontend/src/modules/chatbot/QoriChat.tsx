import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, X } from 'lucide-react'
import { create } from 'zustand'
import { chatbotApi } from '@/core/api/endpoints'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useAuthStore } from '@/core/store/authStore'
import { RButton } from '@/design-system/RButton'

type Message = { id: number; role: 'qori' | 'user'; text: string }
const SUGGESTIONS = [
  '¿Cómo funciona el interés?',
  '¿Ahorro o pago deuda?',
  'Explícame mi estrés',
  '¿Cómo subo mi score?',
]
const greeting: Message = {
  id: 0,
  role: 'qori',
  text: '¡Hola! Soy Qori 🦊. Pregúntame sobre las decisiones de dinero en Pacha.',
}
const useChatSession = create<{
  owner: string
  messages: Message[]
  nextId: number
  syncOwner: (owner: string) => void
  add: (role: Message['role'], text: string) => void
}>((set) => ({
  owner: '',
  messages: [greeting],
  nextId: 1,
  syncOwner: (owner) =>
    set((state) => (state.owner === owner ? state : { owner, messages: [greeting], nextId: 1 })),
  add: (role, text) =>
    set((state) => ({
      messages: [...state.messages, { id: state.nextId, role, text }],
      nextId: state.nextId + 1,
    })),
}))

export function ChatBubble({ message }: { message: Message }) {
  return (
    <div
      className={`max-w-[92%] rounded-card px-3 py-2.5 text-sm leading-relaxed sm:max-w-[85%] sm:px-4 sm:py-3 ${message.role === 'user' ? 'ml-auto bg-fucsia text-white' : 'mr-auto bg-crema text-tinta'}`}
    >
      {message.text}
    </div>
  )
}

export function ActionButtons({
  onChoose,
  disabled,
}: {
  onChoose: (text: string) => void
  disabled: boolean
}) {
  return (
    <div
      className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
      aria-label="Preguntas sugeridas"
    >
      {SUGGESTIONS.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onChoose(text)}
          className="min-h-touch shrink-0 snap-start whitespace-nowrap rounded-full border border-fucsia/30 bg-fucsia-50 px-3 py-2 text-left text-sm font-semibold text-fucsia-700 hover:bg-fucsia-50/70 disabled:opacity-50"
        >
          {text}
        </button>
      ))}
    </div>
  )
}

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [draft, setDraft] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || disabled) return
    onSend(text)
    setDraft('')
  }
  return (
    <form
      onSubmit={submit}
      className="flex gap-2 border-t border-crema-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <label className="sr-only" htmlFor="qori-message">
        Mensaje para Qori
      </label>
      <input
        id="qori-message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={300}
        placeholder="Pregúntale a Qori…"
        className="min-w-0 min-h-touch flex-1 rounded-control border border-crema-300 px-3 outline-none focus:border-fucsia"
      />
      <RButton
        type="submit"
        disabled={!draft.trim() || disabled}
        aria-label="Enviar mensaje"
        icon={<Send aria-hidden className="size-4" />}
      >
        Enviar
      </RButton>
    </form>
  )
}

function ChatWindow({ onClose, embedded = false }: { onClose?: () => void; embedded?: boolean }) {
  const owner = useAuthStore((state) => state.user?.alias ?? '')
  const messages = useChatSession((state) => state.messages)
  const syncOwner = useChatSession((state) => state.syncOwner)
  const add = useChatSession((state) => state.add)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const scrollArea = useRef<HTMLDivElement>(null)
  const pendingRef = useRef(false)
  useEffect(() => {
    syncOwner(owner)
  }, [owner, syncOwner])
  useEffect(() => {
    const area = scrollArea.current
    if (area && (messages.length > 1 || pending)) area.scrollTop = area.scrollHeight
  }, [messages, pending])
  const send = async (text: string) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    setError('')
    add('user', text)
    try {
      const result = await chatbotApi.send({ message: text })
      if (useChatSession.getState().owner === owner) add('qori', result.response)
    } catch (reason) {
      setError(
        reason instanceof Error && 'status' in reason && reason.status === 429
          ? 'Qori necesita un respiro. Intenta de nuevo en un momento.'
          : 'No pude responder. Intenta enviar tu pregunta otra vez.',
      )
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }
  return (
    <section
      aria-label="Chat con Qori"
      className={`flex min-h-0 flex-col overflow-hidden rounded-sheet border border-crema-200 bg-white shadow-raised ${embedded ? 'h-[clamp(340px,calc(100dvh-24rem),620px)]' : 'h-[min(80dvh,680px)]'}`}
    >
      <header className="flex items-center justify-between bg-noche-alta px-4 py-3 text-white">
        <div>
          <h2 className="text-xl">🦊 Qori</h2>
          <p className="text-xs text-white/75">Guía financiera · modo demostración</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Qori"
            className="grid size-touch place-items-center rounded-full hover:bg-white/15"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </header>
      <div
        ref={scrollArea}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {pending && (
          <p className="w-fit rounded-card bg-crema px-4 py-3 text-sm" role="status">
            Qori está pensando…
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-control bg-deuda-50 p-3 text-sm text-deuda-700">
            {error}
          </p>
        )}
      </div>
      <div className="px-3 pb-2">
        <ActionButtons onChoose={send} disabled={pending} />
      </div>
      <ChatInput onSend={send} disabled={pending} />
    </section>
  )
}

export function QoriPage() {
  useDocumentTitle('Qori')
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-fucsia-700">TU GUÍA EN PACHA</p>
        <h1 className="text-3xl">Habla con Qori</h1>
        <p className="mt-1 hidden text-tinta-suave sm:block">
          Respuestas educativas de demostración. La conexión con el asistente real está pendiente.
        </p>
      </div>
      <ChatWindow embedded />
    </div>
  )
}

export function QoriAvatar() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])
  return (
    <>
      <button
        type="button"
        aria-label="Abrir chat con Qori"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--spacing-nav)+env(safe-area-inset-bottom)+0.75rem)] right-4 z-40 grid size-14 place-items-center rounded-full bg-fucsia text-3xl shadow-raised ring-4 ring-white lg:bottom-5"
        title="Pregúntale a Qori"
      >
        🦊
      </button>
      <dialog
        ref={dialog}
        aria-label="Chat con Qori"
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none bg-transparent p-2 backdrop:bg-tinta/60 sm:inset-0 sm:m-auto sm:max-w-xl sm:p-0"
      >
        <ChatWindow onClose={() => setOpen(false)} />
      </dialog>
    </>
  )
}
