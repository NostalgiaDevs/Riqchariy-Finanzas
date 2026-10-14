import { useId } from 'react'
import { cn } from '@/core/utils/cn'

// Estrellas fijas (posiciones deterministas: no cambian entre renders ni entre servidores).
const STARS: [number, number, number][] = [
  [60, 60, 1.4],
  [150, 140, 1],
  [230, 40, 1.2],
  [320, 110, 0.9],
  [410, 70, 1.5],
  [500, 150, 1],
  [585, 45, 1.1],
  [690, 120, 0.8],
  [760, 30, 1.3],
  [850, 95, 1],
  [930, 160, 1.2],
  [1010, 55, 0.9],
  [1100, 125, 1.4],
  [1180, 35, 1],
  [1260, 105, 1.2],
  [1350, 60, 0.9],
  [1405, 150, 1.1],
  [110, 230, 0.8],
  [380, 220, 1],
  [640, 210, 0.8],
  [880, 240, 0.9],
  [1220, 210, 0.8],
  [1320, 250, 1],
  [470, 280, 0.7],
]

/** Estrellas de fondo para el cielo nocturno. Cubre todo el contenedor. */
export function NightStars({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMin slice"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    >
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity={0.55} />
      ))}
    </svg>
  )
}

/**
 * El mismo amanecer en una franja de 44px: borde inferior de la cabecera de la app.
 * El Inti asoma entre dos cerros y el suelo toma el color del contenido que sigue,
 * así lo que se desplaza por debajo parece pasar detrás de la cordillera.
 *
 * La cordillera mide 1440 de ancho y el alto se queda fijo: en celular se ve el tramo central
 * (con el Inti) y en PC la franja completa, sin estirarse ni pixelarse.
 */
export function HorizonEdge({
  className,
  animated = true,
  inti = true,
  sky = 'var(--color-anil)',
  ground = 'var(--color-crema)',
}: {
  className?: string
  animated?: boolean
  /** false cuando ya hay otro sol en pantalla (ej. la cabecera de la app). */
  inti?: boolean
  /** El cielo va dentro del SVG: un fondo CSS se ajusta al píxel y deja una línea oscura bajo el suelo. */
  sky?: string
  ground?: string
}) {
  const id = useId().replace(/:/g, '')
  const glow = `edge-glow-${id}`

  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 44"
      preserveAspectRatio="xMidYMax slice"
      className={cn('pointer-events-none block h-11 w-full', className)}
    >
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#f6b44a" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#d62e6c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#d62e6c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="-400" width="2240" height="44" fill={sky} />
      {/* El Inti queda un poco a la derecha del centro: visible desde 320px de ancho. */}
      {inti ? (
        <>
          <ellipse cx="766" cy="32" rx="80" ry="22" fill={`url(#${glow})`} />
          <g className={animated ? 'animate-asomar' : undefined}>
            <circle cx="766" cy="31" r="17" fill="#f2a81d" opacity="0.2" />
            <circle cx="766" cy="31" r="12" fill="var(--color-inti-claro)" />
          </g>
        </>
      ) : null}

      <path
        fill="var(--color-cerro)"
        d="M0 33 L34 26 L66 31 L98 22 L130 30 L164 24 L198 32 L236 20 L268 29 L300 25 L334 31 L370 23 L404 30 L440 26 L474 33 L508 22 L540 30 L572 27 L606 32 L644 21 L676 29 L704 25 L732 20 L758 30 L776 29 L800 21 L828 31 L862 24 L892 30 L926 26 L962 32 L996 20 L1030 29 L1062 24 L1096 31 L1130 23 L1164 30 L1196 26 L1232 33 L1266 21 L1300 29 L1334 25 L1368 31 L1404 24 L1440 29 V48 H0Z"
      />
      <path
        fill="var(--color-cerro-oscuro)"
        d="M0 38 L40 34 L80 38 L120 31 L160 37 L200 33 L240 38 L280 34 L320 38 L360 32 L400 37 L440 33 L480 38 L520 31 L560 37 L600 34 L640 38 L680 32 L720 37 L760 34 L800 38 L840 33 L880 37 L920 31 L960 38 L1000 34 L1040 37 L1080 32 L1120 38 L1160 33 L1200 37 L1240 31 L1280 38 L1320 34 L1360 37 L1400 32 L1440 36 V48 H0Z"
      />
      {/* Baja más allá del viewBox: ver el suelo de AndeanDawn. */}
      <path
        fill={ground}
        d="M0 48 V42 L60 39.5 L128 42 L204 39.5 L280 42 L344 39.5 L420 41.5 L500 39.5 L580 42 L660 39.5 L740 42 L820 39.5 L900 41.5 L980 39.5 L1060 42 L1140 39.5 L1220 42 L1300 39.5 L1380 41.5 L1440 40 V48Z"
      />
    </svg>
  )
}

/**
 * Amanecer en los Andes: el Inti (sol y moneda del juego) sale detrás de los Apu.
 * "Riqchariy" significa despertar. El borde inferior toma el color `ground`
 * para que la sección siguiente parezca nacer de los cerros.
 */
export function AndeanDawn({
  className,
  animated = true,
  ground = 'var(--color-crema)',
}: {
  className?: string
  animated?: boolean
  ground?: string
}) {
  const id = useId().replace(/:/g, '')
  const glow = `glow-${id}`
  const sunFill = `sun-${id}`

  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax slice"
      className={cn('pointer-events-none block w-full', className)}
    >
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#f6b44a" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#d62e6c" stopOpacity="0.3" />
          <stop offset="1" stopColor="#d62e6c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={sunFill} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#ffd37a" />
          <stop offset="1" stopColor="#f2a81d" />
        </radialGradient>
      </defs>

      <ellipse cx="760" cy="270" rx="620" ry="170" fill={`url(#${glow})`} />

      {/* El Inti */}
      <g className={animated ? 'animate-amanecer' : undefined}>
        <circle cx="760" cy="195" r="118" fill="#f2a81d" opacity="0.12" />
        <circle cx="760" cy="195" r="96" fill="#f2a81d" opacity="0.18" />
        <circle cx="760" cy="195" r="80" fill={`url(#${sunFill})`} />
        <circle
          cx="760"
          cy="195"
          r="66"
          fill="none"
          stroke="#b7790a"
          strokeOpacity="0.35"
          strokeWidth="3"
        />
      </g>

      {/* Cordillera lejana */}
      <path
        fill="#3b2c63"
        d="M0 260 L90 200 L160 235 L260 140 L340 210 L430 170 L520 225 L610 130 L700 190 L790 150 L880 212 L980 120 L1070 185 L1160 140 L1250 200 L1340 160 L1440 190 V400 H0Z"
      />

      {/* Cordillera media */}
      <path
        fill="#232a4d"
        d="M0 310 L120 250 L210 290 L330 220 L430 280 L540 240 L650 295 L760 230 L860 285 L960 245 L1080 300 L1190 235 L1300 280 L1440 240 V400 H0Z"
      />

      {/* Suelo: el color de la sección que sigue. Baja más allá del viewBox (el SVG lo recorta)
          para que la última fila de píxeles quede pintada entera y no aparezca una línea oscura. */}
      <path
        fill={ground}
        d="M0 360 L140 320 L260 352 L400 310 L540 345 L700 318 L860 355 L1000 325 L1150 352 L1300 322 L1440 345 V420 H0Z"
      />
    </svg>
  )
}
