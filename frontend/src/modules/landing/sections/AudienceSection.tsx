import type { ComponentType, SVGProps } from 'react'
import { ChartColumn, Coins, KeyRound, MessageCircle, ShieldCheck, Timer } from 'lucide-react'

interface Point {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  text: string
}

const FOR_SCHOOLS: Point[] = [
  {
    icon: ChartColumn,
    title: 'Un reporte por alumno',
    text: 'Disciplina de ahorro, manejo de deudas, riesgo e impulsividad, medidos por lo que cada alumno decide en el juego y no por un examen.',
  },
  {
    icon: Timer,
    title: 'Sesiones cortas',
    text: 'De 5 a 10 minutos, dos a cuatro veces por semana, más una sesión guiada en clase.',
  },
  {
    icon: KeyRound,
    title: 'Aulas con código',
    text: 'El docente comparte un código y sus alumnos entran a la misma economía y al mismo ranking.',
  },
]

const FOR_FAMILIES: Point[] = [
  {
    icon: Coins,
    title: 'Sin dinero real',
    text: 'Se juega con intis, la moneda del juego. No hay compras, pagos ni publicidad.',
  },
  {
    icon: ShieldCheck,
    title: 'Datos protegidos',
    text: 'Cumplimos la Ley 29733. Los alumnos usan un alias, el consentimiento lo gestiona el colegio y los datos nunca se venden.',
  },
  {
    icon: MessageCircle,
    title: 'Un guía que no se sale del tema',
    text: 'Qori solo habla de finanzas y del juego, con un tono pensado para chicos de 12 a 17 años.',
  },
]

function PointList({ title, points, id }: { title: string; points: Point[]; id?: string }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-sheet bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
      <h3 className="text-2xl">{title}</h3>
      <ul className="mt-6 flex flex-col gap-6">
        {points.map(({ icon: Icon, title: pointTitle, text }) => (
          <li key={pointTitle} className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-dorado">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <h4 className="font-semibold text-white">{pointTitle}</h4>
              <p className="mt-1 leading-relaxed text-white/75">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AudienceSection() {
  return (
    <section
      id="colegios"
      aria-labelledby="colegios-title"
      className="scroll-mt-16 bg-tinta py-20 text-white sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-gutter sm:px-6">
        <div className="max-w-2xl">
          <h2 id="colegios-title" className="text-3xl sm:text-4xl">
            Para colegios y familias
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/75">
            Riqchariy lo contrata el colegio y lo juegan sus alumnos de 12 a 17 años. Esto es lo que
            cada uno necesita saber.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <PointList title="Lo que recibe el colegio" points={FOR_SCHOOLS} />
          <PointList id="familias" title="Lo que deben saber las familias" points={FOR_FAMILIES} />
        </div>
      </div>
    </section>
  )
}
