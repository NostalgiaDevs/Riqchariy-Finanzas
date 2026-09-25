import { RBadge } from '@/design-system/RBadge'
import { RCard } from '@/design-system/RCard'

/** Placeholder de las pantallas que llegan en sprints posteriores. */
export function ComingSoon({
  title,
  icon,
  text,
  sprint,
}: {
  title: string
  icon: string
  text: string
  sprint: number
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl">{title}</h1>
      <RCard className="flex flex-col items-center gap-3 py-10 text-center">
        <span aria-hidden className="text-5xl">
          {icon}
        </span>
        <p className="max-w-xs text-tinta-suave">{text}</p>
        <RBadge tone="fucsia">Llega en el Sprint {sprint}</RBadge>
      </RCard>
    </div>
  )
}
