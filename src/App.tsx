import { useState } from 'react'
import {
  Activity,
  Crosshair,
  Globe2,
  Headphones,
  Map,
  Menu,
  Play,
  RadioTower,
  Radar,
  Settings,
  Shield,
  Swords,
  Users,
  Volume2,
} from 'lucide-react'
import { GameCanvas } from './game/GameCanvas'
import { UnitIcon } from './components/UnitIcon'

const battlegroup = [
  { type: 'recon' as const, name: 'Raven Recon', count: 2, cost: 45 },
  { type: 'tank' as const, name: 'Manticore MBT', count: 4, cost: 120 },
  { type: 'infantry' as const, name: 'Viper Infantry', count: 6, cost: 35 },
  { type: 'artillery' as const, name: 'Atlas SPG', count: 2, cost: 95 },
  { type: 'air-defense' as const, name: 'Aegis SAM', count: 2, cost: 80 },
  { type: 'helicopter' as const, name: 'Falcon Gunship', count: 1, cost: 140 },
]

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <main className="app-shell">
      <GameCanvas />

      {!started && (
        <section className="landing">
          <div className="scanlines" />
          <nav className="landing-nav">
            <div className="brand">
              <img src="frontline-zero.svg" alt="" />
              <div>
                <strong>FRONTLINE</strong>
                <span>ZERO</span>
              </div>
            </div>
            <div className="nav-actions">
              <button className="icon-button"><Headphones size={18} /></button>
              <button className="icon-button"><Settings size={18} /></button>
            </div>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><RadioTower size={16} /> LIVE THEATER // SECTOR C7</div>
              <h1>COMMAND<br /><em>THE FRONT.</em></h1>
              <p>
                Browser tactical warfare sandbox. Build your battlegroup, capture the sector,
                cut logistics and change the global frontline.
              </p>
              <div className="hero-actions">
                <button className="primary" onClick={() => setStarted(true)}>
                  <Play size={20} fill="currentColor" /> DEPLOY NOW
                </button>
                <button className="secondary"><Users size={20} /> CREATE SQUAD</button>
              </div>
              <div className="server-strip">
                <span><i className="online" /> EU EAST</span>
                <span>32 ms</span>
                <span>v0.1 PRE-ALPHA</span>
              </div>
            </div>

            <aside className="operation-card">
              <div className="operation-head">
                <span>ACTIVE OPERATION</span>
                <strong>04:18:27</strong>
              </div>
              <div className="theater-map">
                <div className="frontline-path" />
                <span className="node n1">A</span>
                <span className="node n2 hot">B</span>
                <span className="node n3">C</span>
                <div className="map-label">KARSTEN THEATER</div>
              </div>
              <div className="operation-stats">
                <div><span>BLUE CONTROL</span><strong>47%</strong></div>
                <div><span>RED CONTROL</span><strong>53%</strong></div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {started && (
        <section className="battle-ui">
          <header className="topbar">
            <div className="brand compact">
              <img src="frontline-zero.svg" alt="" />
              <div><strong>FRONTLINE</strong><span>ZERO</span></div>
            </div>

            <div className="sector-status">
              <span className="faction blue"><Shield size={16} /> BLUE 420</span>
              <div>
                <small>SECTOR C7 // NOVYI KRAI</small>
                <strong>18:42</strong>
              </div>
              <span className="faction red">390 RED <Crosshair size={16} /></span>
            </div>

            <div className="top-actions">
              <button className="icon-button"><Volume2 size={17} /></button>
              <button className="icon-button"><Settings size={17} /></button>
              <button className="icon-button"><Menu size={17} /></button>
            </div>
          </header>

          <aside className="left-panel">
            <div className="panel-title">
              <div><Swords size={18} /><span>BATTLEGROUP</span></div>
              <strong>1,240</strong>
            </div>
            <div className="unit-list">
              {battlegroup.map((unit, index) => (
                <button className="unit-card" key={unit.name}>
                  <span className="unit-number">0{index + 1}</span>
                  <span className="unit-glyph"><UnitIcon type={unit.type} /></span>
                  <span className="unit-copy">
                    <strong>{unit.name}</strong>
                    <small>{unit.type.toUpperCase()}</small>
                  </span>
                  <span className="unit-meta"><b>×{unit.count}</b><small>{unit.cost}</small></span>
                </button>
              ))}
            </div>

            <div className="commander-card">
              <div className="commander-icon"><Radar size={22} /></div>
              <div><small>COMMANDER BONUS</small><strong>TACTICAL RECON</strong></div>
              <span>+15%</span>
            </div>
          </aside>

          <aside className="right-intel">
            <div className="intel-head"><Activity size={16} /> BATTLE FEED</div>
            <div className="feed-line"><time>18:41</time><p><b>RAVEN-01</b> spotted enemy armor</p></div>
            <div className="feed-line warning"><time>18:40</time><p>Sector <b>B</b> contested</p></div>
            <div className="feed-line"><time>18:38</time><p><b>ATLAS-30</b> ready to fire</p></div>
          </aside>

          <div className="mini-map">
            <div className="mini-grid" />
            <span className="mini-blue b1" />
            <span className="mini-blue b2" />
            <span className="mini-red r1" />
            <span className="mini-red r2" />
            <div className="mini-front" />
          </div>

          <footer className="command-bar">
            <div className="command-hint"><kbd>LMB</kbd> SELECT</div>
            <div className="command-hint"><kbd>RMB</kbd> MOVE / ATTACK</div>
            <div className="command-hint"><kbd>WASD</kbd> CAMERA</div>
            <div className="command-hint"><kbd>WHEEL</kbd> ZOOM</div>
            <button><Map size={17} /> TACTICAL MAP</button>
            <button><Globe2 size={17} /> THEATER</button>
          </footer>
        </section>
      )}
    </main>
  )
}