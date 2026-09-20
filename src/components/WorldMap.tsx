import { Crosshair, Shield } from 'lucide-react'
import { sectorLinks, type Sector } from '../data/world'

type Props = {
  sectors: Sector[]
  selectedId: string
  onSelect: (sector: Sector) => void
}

export function WorldMap({ sectors, selectedId, onSelect }: Props) {
  const byId = new Map(sectors.map((sector) => [sector.id, sector]))

  return (
    <div className="world-map-wrap">
      <div className="map-scan" />
      <svg className="world-map" viewBox="0 0 1000 620" role="img" aria-label="Frontline world map">
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#69ffd0" stopOpacity=".08" />
            <stop offset="100%" stopColor="#69ffd0" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path className="continent c1" d="M70 92 L245 35 L430 66 L535 25 L700 78 L930 118 L952 275 L884 430 L808 572 L590 590 L400 556 L234 584 L82 462 L54 286 Z" />
        <path className="continent c2" d="M112 146 L265 87 L424 103 L530 67 L700 107 L864 150 L906 270 L836 405 L758 520 L593 538 L408 510 L255 535 L126 436 L95 285 Z" />
        <ellipse cx="500" cy="300" rx="390" ry="255" fill="url(#mapGlow)" />

        {sectorLinks.map(([a, b]) => {
          const first = byId.get(a)
          const second = byId.get(b)
          if (!first || !second) return null
          const hot = first.contested || second.contested
          return (
            <line
              key={a + b}
              className={hot ? 'supply-line hot' : 'supply-line'}
              x1={first.x}
              y1={first.y}
              x2={second.x}
              y2={second.y}
            />
          )
        })}

        <path className="front-wave" d="M365 40 C410 125 470 138 486 210 C504 293 454 322 501 390 C535 438 590 452 618 584" />
        <path className="front-wave echo" d="M382 38 C427 124 485 141 502 210 C520 292 470 325 518 389 C551 433 607 448 636 582" />

        {sectors.map((sector) => {
          const side = sector.owner === 'aegis' ? 'blue' : sector.owner === 'vanguard' ? 'red' : 'neutral'
          const selected = sector.id === selectedId
          return (
            <g
              key={sector.id}
              className={`sector-node ${side} ${sector.contested ? 'contested' : ''} ${selected ? 'selected' : ''}`}
              transform={`translate(${sector.x} ${sector.y})`}
              onClick={() => onSelect(sector)}
            >
              {sector.contested && <circle className="sector-pulse" r="29" />}
              <circle className="sector-ring" r="22" />
              <circle className="sector-core" r="13" />
              <text className="sector-id" textAnchor="middle" y="4">{sector.id}</text>
              <text className="sector-name" textAnchor="middle" y="42">{sector.name}</text>
              <text className="sector-pop" textAnchor="middle" y="56">{sector.players} ONLINE</text>
            </g>
          )
        })}
      </svg>

      <div className="map-legend">
        <span><i className="dot blue" /> AEGIS <Shield size={12} /></span>
        <span><i className="dot contested" /> CONTESTED <Crosshair size={12} /></span>
        <span><i className="dot red" /> VANGUARD</span>
      </div>
    </div>
  )
}
