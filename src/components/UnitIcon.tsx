type UnitType = 'tank' | 'infantry' | 'recon' | 'artillery' | 'air-defense' | 'helicopter'

export function UnitIcon({ type, size = 26 }: { type: UnitType; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (type === 'tank') return (
    <svg {...common}>
      <rect x="4" y="11" width="20" height="10" rx="3" />
      <rect x="10" y="8" width="9" height="6" rx="2" />
      <path d="M18.5 10.5 28 7" />
      <path d="M7 24h15M7 8h2M4 16h20" />
    </svg>
  )
  if (type === 'infantry') return (
    <svg {...common}>
      <circle cx="16" cy="7" r="3" />
      <path d="M16 10v8m0-5-6 4m6-4 6 4m-6 1-4 8m4-8 5 8" />
    </svg>
  )
  if (type === 'recon') return (
    <svg {...common}>
      <path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16Z" />
      <circle cx="16" cy="16" r="4" />
      <path d="M16 4V2m0 28v-2M4 16H2m28 0h-2" />
    </svg>
  )
  if (type === 'artillery') return (
    <svg {...common}>
      <circle cx="10" cy="23" r="3" />
      <circle cx="22" cy="23" r="3" />
      <path d="M9 20h14l-2-8H11l-2 8Zm7-8V5m0 0 7-3m-7 3-6-2" />
    </svg>
  )
  if (type === 'air-defense') return (
    <svg {...common}>
      <path d="M6 24h20M10 24l2-8h8l2 8M16 16V6" />
      <path d="m16 6-6 4m6-4 6 4" />
      <circle cx="16" cy="6" r="2" />
    </svg>
  )
  return (
    <svg {...common}>
      <path d="M3 18h9l4-6 4 6h9M9 18l-4 5m18-5 4 5" />
      <ellipse cx="16" cy="18" rx="5" ry="3" />
      <path d="M16 15V8m-7 0h14M11 5h10" />
    </svg>
  )
}