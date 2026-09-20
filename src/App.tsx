import { FormEvent, lazy, Suspense, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  ChevronRight,
  CircleUserRound,
  Crosshair,
  Crown,
  Globe2,
  LayoutDashboard,
  Map,
  MessageSquare,
  Play,
  Radio,
  RotateCcw,
  Shield,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { WorldMap } from './components/WorldMap'
import {
  initialEvents,
  roles,
  sectorsSeed,
  type FactionId,
  type Sector,
} from './data/world'

const GameCanvas = lazy(() => import('./game/GameCanvas').then((module) => ({ default: module.GameCanvas })))

type AppView = 'world' | 'hq' | 'faction' | 'profile' | 'tactical'
type PlayerFaction = Exclude<FactionId, 'neutral'>
type WarEvent = { time: string; side: FactionId; text: string }
type ChatMessage = { name: string; side: FactionId; text: string }

const factionInfo = {
  aegis: {
    name: 'AEGIS COALITION',
    short: 'AEGIS',
    motto: 'Hold the line. Own the initiative.',
  },
  vanguard: {
    name: 'VANGUARD PACT',
    short: 'VANGUARD',
    motto: 'Pressure. Breakthrough. Control.',
  },
} as const

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [view, setView] = useState<AppView>('world')
  const [sectors, setSectors] = useState<Sector[]>(sectorsSeed)
  const [selectedId, setSelectedId] = useState('C2')
  const [events, setEvents] = useState<WarEvent[]>(initialEvents)
  const [faction, setFaction] = useState<PlayerFaction | null>(() => {
    const saved = localStorage.getItem('frontline-faction')
    return saved === 'aegis' || saved === 'vanguard' ? saved : null
  })
  const [role, setRole] = useState(() => localStorage.getItem('frontline-role') || 'recon')
  const [callsign, setCallsign] = useState(() => localStorage.getItem('frontline-callsign') || 'RAVEN-021')
  const [deployments, setDeployments] = useState(() => Number(localStorage.getItem('frontline-deployments') || '0'))
  const [chat, setChat] = useState<ChatMessage[]>([
    { name: 'HQ', side: 'aegis', text: 'C2 needs more pressure. Keep the supply line open.' },
    { name: 'KRAKEN-4', side: 'aegis', text: 'Armor group moving toward Karsten.' },
    { name: 'SYSTEM', side: 'neutral', text: 'Prototype chat is local-only in this build.' },
  ])
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')

  const selected = sectors.find((sector) => sector.id === selectedId) || sectors[0]
  const myFaction = faction ? factionInfo[faction] : null

  const stats = useMemo(() => {
    const aegisOwned = sectors.filter((s) => s.owner === 'aegis').length
    const vanguardOwned = sectors.filter((s) => s.owner === 'vanguard').length
    const contested = sectors.filter((s) => s.contested).length
    const players = sectors.reduce((sum, s) => sum + s.players, 0)
    return { aegisOwned, vanguardOwned, contested, players }
  }, [sectors])

  function chooseFaction(side: PlayerFaction) {
    setFaction(side)
    localStorage.setItem('frontline-faction', side)
    setToast(`Joined ${factionInfo[side].name}`)
    window.setTimeout(() => setToast(''), 1800)
  }

  function selectSector(sector: Sector) {
    setSelectedId(sector.id)
  }

  function reinforceSector() {
    if (!faction) {
      setToast('Choose a faction first')
      return
    }

    const sideName = factionInfo[faction].short
    setSectors((current) =>
      current.map((sector) => {
        if (sector.id !== selected.id) return sector

        const swing = 7
        const nextAegis = clamp(sector.aegis + (faction === 'aegis' ? swing : -swing))
        const nextVanguard = 100 - nextAegis
        let owner: FactionId = sector.owner
        let contested = true

        if (nextAegis >= 68) {
          owner = 'aegis'
          contested = false
        } else if (nextVanguard >= 68) {
          owner = 'vanguard'
          contested = false
        }

        return {
          ...sector,
          aegis: nextAegis,
          vanguard: nextVanguard,
          owner,
          contested,
          players: sector.players + 1,
        }
      }),
    )

    const nextDeployments = deployments + 1
    setDeployments(nextDeployments)
    localStorage.setItem('frontline-deployments', String(nextDeployments))
    setEvents((current) => [
      { time: nowTime(), side: faction, text: `${callsign} reinforced ${selected.name} for ${sideName}.` },
      ...current,
    ].slice(0, 8))
    setToast(`+7% influence in ${selected.id}`)
    window.setTimeout(() => setToast(''), 1800)
  }

  function simulateWar() {
    const targets = sectors.filter((sector) => sector.contested)
    if (!targets.length) return
    const target = targets[Math.floor(Math.random() * targets.length)]
    const attacking: PlayerFaction = Math.random() > 0.5 ? 'aegis' : 'vanguard'
    const swing = 4 + Math.floor(Math.random() * 7)

    setSectors((current) =>
      current.map((sector) => {
        if (sector.id !== target.id) return sector
        const nextAegis = clamp(sector.aegis + (attacking === 'aegis' ? swing : -swing))
        const nextVanguard = 100 - nextAegis
        let owner: FactionId = sector.owner
        let contested = true
        if (nextAegis >= 68) {
          owner = 'aegis'
          contested = false
        } else if (nextVanguard >= 68) {
          owner = 'vanguard'
          contested = false
        }
        return { ...sector, aegis: nextAegis, vanguard: nextVanguard, owner, contested }
      }),
    )
    setEvents((current) => [
      { time: nowTime(), side: attacking, text: `${factionInfo[attacking].short} shifted the front at ${target.name}.` },
      ...current,
    ].slice(0, 8))
  }

  function assignRole(nextRole: string) {
    setRole(nextRole)
    localStorage.setItem('frontline-role', nextRole)
    setToast('HQ role updated')
    window.setTimeout(() => setToast(''), 1600)
  }

  function saveCallsign() {
    const cleaned = callsign.trim().toUpperCase().slice(0, 18) || 'RAVEN-021'
    setCallsign(cleaned)
    localStorage.setItem('frontline-callsign', cleaned)
    setToast('Callsign saved')
    window.setTimeout(() => setToast(''), 1600)
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    const text = message.trim()
    if (!text) return
    const chatSide: FactionId = faction ?? 'neutral'
    const nextMessage: ChatMessage = { name: callsign, side: chatSide, text }
    setChat((current) => [...current, nextMessage].slice(-8))
    setMessage('')
  }

  function resetPrototype() {
    localStorage.removeItem('frontline-faction')
    localStorage.removeItem('frontline-role')
    localStorage.removeItem('frontline-callsign')
    localStorage.removeItem('frontline-deployments')
    setFaction(null)
    setRole('recon')
    setCallsign('RAVEN-021')
    setDeployments(0)
    setSectors(sectorsSeed)
    setSelectedId('C2')
    setEvents(initialEvents)
    setToast('Local prototype reset')
  }

  if (!entered) {
    return (
      <main className="world-shell splash">
        <div className="noise" />
        <div className="splash-orbit orbit-one" />
        <div className="splash-orbit orbit-two" />
        <header className="splash-header">
          <Brand />
          <span className="build-badge"><i /> LOCAL PROTOTYPE // v0.2</span>
        </header>

        <section className="splash-content">
          <div className="splash-copy">
            <div className="eyebrow"><Radio size={16} /> PERSISTENT BROWSER WAR</div>
            <h1>THE WAR<br /><span>NEVER STOPS.</span></h1>
            <p>
              Pick a faction, reinforce sectors, join a command role and watch the global
              frontline move. This build runs entirely on local mock data for fast testing.
            </p>
            <button className="primary big" onClick={() => setEntered(true)}>
              ENTER WAR ROOM <ChevronRight size={20} />
            </button>
          </div>

          <div className="splash-radar">
            <div className="radar-sweep" />
            <div className="radar-ring r1" />
            <div className="radar-ring r2" />
            <div className="radar-ring r3" />
            <span className="ping p1" />
            <span className="ping p2" />
            <span className="ping p3" />
            <div className="radar-core">LIVE<br /><b>{stats.players}</b><small>TEST UNITS</small></div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="world-shell">
      <div className="noise" />
      {toast && <div className="toast">{toast}</div>}

      <header className="world-topbar">
        <Brand />
        <nav className="topnav">
          <button className={view === 'world' ? 'active' : ''} onClick={() => setView('world')}><Globe2 size={17} /> WORLD</button>
          <button className={view === 'hq' ? 'active' : ''} onClick={() => setView('hq')}><LayoutDashboard size={17} /> HQ</button>
          <button className={view === 'faction' ? 'active' : ''} onClick={() => setView('faction')}><Shield size={17} /> FACTION</button>
          <button className={view === 'tactical' ? 'active' : ''} onClick={() => setView('tactical')}><Swords size={17} /> TACTICAL TEST</button>
        </nav>
        <button className="profile-chip" onClick={() => setView('profile')}>
          <CircleUserRound size={20} />
          <span><b>{callsign}</b><small>{myFaction?.short || 'NO FACTION'}</small></span>
        </button>
      </header>

      {view === 'tactical' ? (
        <section className="tactical-page">
          <div className="tactical-head">
            <div><span className="section-kicker">LEGACY TEST RANGE</span><h2>Tactical battle sandbox</h2></div>
            <button className="ghost-button" onClick={() => setView('world')}><Map size={16} /> RETURN TO WORLD</button>
          </div>
          <div className="tactical-frame">
            <Suspense fallback={<div className="loading">LOADING TACTICAL MODULE…</div>}>
              <GameCanvas />
            </Suspense>
          </div>
        </section>
      ) : (
        <div className="world-layout">
          <aside className="left-rail">
            <div className="rail-block war-status">
              <span className="section-kicker">GLOBAL WAR // DAY 01</span>
              <div className="faction-score blue"><span>AEGIS</span><b>{stats.aegisOwned}</b></div>
              <div className="score-track"><i style={{ width: `${(stats.aegisOwned / sectors.length) * 100}%` }} /><em /></div>
              <div className="faction-score red"><span>VANGUARD</span><b>{stats.vanguardOwned}</b></div>
            </div>

            <div className="rail-block quick-stats">
              <Metric icon={<Activity size={16} />} label="Active sectors" value={String(stats.contested)} />
              <Metric icon={<Users size={16} />} label="Players in theater" value={String(stats.players)} />
              <Metric icon={<Target size={16} />} label="Your deployments" value={String(deployments)} />
            </div>

            <div className="rail-block event-log">
              <div className="rail-title"><span>WAR FEED</span><Activity size={15} /></div>
              {events.map((event, index) => (
                <div className="event-row" key={event.time + index}>
                  <time>{event.time}</time>
                  <i className={event.side} />
                  <p>{event.text}</p>
                </div>
              ))}
            </div>

            <button className="simulate-button" onClick={simulateWar}><Zap size={15} /> SIMULATE FRONT UPDATE</button>
          </aside>

          <section className="main-stage">
            {view === 'world' && (
              <>
                <div className="stage-heading">
                  <div>
                    <span className="section-kicker">KARSTEN THEATER // LIVE MOCK MAP</span>
                    <h2>Global Frontline</h2>
                  </div>
                  <div className="live-pill"><i /> LOCAL SIMULATION</div>
                </div>
                <WorldMap sectors={sectors} selectedId={selected.id} onSelect={selectSector} />
              </>
            )}

            {view === 'hq' && (
              <section className="panel-page">
                <div className="stage-heading">
                  <div><span className="section-kicker">COMMAND STRUCTURE</span><h2>Headquarters</h2></div>
                  <div className="live-pill"><i /> {role.toUpperCase()}</div>
                </div>
                <div className="role-grid">
                  {roles.map((item) => (
                    <button className={role === item.id ? 'role-card selected' : 'role-card'} key={item.id} onClick={() => assignRole(item.id)}>
                      <span className="role-icon">{item.id === 'commander' ? <Crown /> : item.id === 'armor' ? <Shield /> : item.id === 'artillery' ? <Crosshair /> : <Target />}</span>
                      <strong>{item.name}</strong>
                      <p>{item.desc}</p>
                      <footer><span>{item.slots} ONLINE</span><b>{role === item.id ? 'ASSIGNED' : 'ASSIGN'}</b></footer>
                    </button>
                  ))}
                </div>
                <div className="command-board">
                  <div><span className="section-kicker">CURRENT DIRECTIVE</span><h3>Hold C2 and pressure D2.</h3><p>Mock strategic directive. Later this will come from the live Commander layer.</p></div>
                  <div className="directive-mark"><Target size={36} /><b>C2 → D2</b></div>
                </div>
              </section>
            )}

            {view === 'faction' && (
              <section className="panel-page">
                <div className="stage-heading">
                  <div><span className="section-kicker">FACTION OPERATIONS</span><h2>{myFaction?.name || 'Choose your side'}</h2></div>
                </div>
                {!faction ? (
                  <FactionPicker onPick={chooseFaction} />
                ) : (
                  <div className="faction-dashboard">
                    <div className={`faction-hero ${faction}`}>
                      <Shield size={42} />
                      <div><span>{myFaction?.motto}</span><h3>{myFaction?.name}</h3><p>Your prototype identity is stored only in this browser.</p></div>
                    </div>
                    <div className="leaderboard-card">
                      <div className="rail-title"><span>TOP OPERATORS</span><Trophy size={16} /></div>
                      {['KRAKEN-4', 'VEX-12', 'ORBIT-7', callsign].map((name, index) => (
                        <div className="leader-row" key={name}><span>#{index + 1}</span><b>{name}</b><em>{1280 - index * 147} XP</em></div>
                      ))}
                    </div>
                    <div className="faction-numbers">
                      <Metric icon={<Shield size={18} />} label="Controlled sectors" value={String(faction === 'aegis' ? stats.aegisOwned : stats.vanguardOwned)} />
                      <Metric icon={<Swords size={18} />} label="Active operations" value={String(stats.contested)} />
                      <Metric icon={<BarChart3 size={18} />} label="War contribution" value={`${deployments * 7} pts`} />
                    </div>
                  </div>
                )}
              </section>
            )}

            {view === 'profile' && (
              <section className="panel-page">
                <div className="stage-heading">
                  <div><span className="section-kicker">LOCAL PLAYER PROFILE</span><h2>Operator identity</h2></div>
                </div>
                <div className="profile-page-grid">
                  <div className="profile-card-large">
                    <CircleUserRound size={54} />
                    <label>CALLSIGN<input value={callsign} onChange={(e) => setCallsign(e.target.value)} maxLength={18} /></label>
                    <button className="primary" onClick={saveCallsign}>SAVE CALLSIGN</button>
                  </div>
                  <div className="profile-card-large stats">
                    <Metric icon={<Target size={18} />} label="Deployments" value={String(deployments)} />
                    <Metric icon={<Shield size={18} />} label="Faction" value={myFaction?.short || 'NONE'} />
                    <Metric icon={<LayoutDashboard size={18} />} label="HQ role" value={role.toUpperCase()} />
                    <button className="danger-ghost" onClick={resetPrototype}><RotateCcw size={15} /> RESET LOCAL DATA</button>
                  </div>
                </div>
              </section>
            )}
          </section>

          <aside className="right-rail">
            <div className="sector-detail">
              <div className="detail-top">
                <span className="section-kicker">SELECTED SECTOR</span>
                <b className={selected.contested ? 'status contested' : 'status stable'}>{selected.contested ? 'CONTESTED' : 'STABLE'}</b>
              </div>
              <h3>{selected.id} // {selected.name}</h3>
              <p>{selected.terrain} sector · strategic value {selected.value}/5</p>

              <div className="influence-label"><span>AEGIS</span><b>{selected.aegis}%</b></div>
              <div className="influence blue"><i style={{ width: `${selected.aegis}%` }} /></div>
              <div className="influence-label red-text"><span>VANGUARD</span><b>{selected.vanguard}%</b></div>
              <div className="influence red"><i style={{ width: `${selected.vanguard}%` }} /></div>

              <div className="sector-meta">
                <Metric icon={<Users size={16} />} label="Operators" value={String(selected.players)} />
                <Metric icon={<Target size={16} />} label="Strategic value" value={String(selected.value)} />
              </div>

              <button className="primary deploy" onClick={reinforceSector}><Play size={17} fill="currentColor" /> JOIN OPERATION</button>
              {!faction && <small className="hint-text">Choose a faction first to affect the frontline.</small>}
            </div>

            <div className="chat-panel">
              <div className="rail-title"><span>HQ TEXT // LOCAL</span><MessageSquare size={15} /></div>
              <div className="chat-scroll">
                {chat.map((line, index) => (
                  <div className="chat-line" key={index}>
                    <b className={line.side}>{line.name}</b>
                    <p>{line.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="chat-form">
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type local test message…" />
                <button><ChevronRight size={16} /></button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {!faction && view !== 'faction' && (
        <div className="faction-banner">
          <span><Shield size={17} /> YOU ARE NOT ALIGNED</span>
          <button onClick={() => setView('faction')}>CHOOSE FACTION</button>
        </div>
      )}
    </main>
  )
}

function Brand() {
  return (
    <div className="brand world-brand">
      <img src="frontline-zero.svg" alt="" />
      <div><strong>FRONTLINE</strong><span>WORLD</span></div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span><small>{label}</small><b>{value}</b></span>
    </div>
  )
}

function FactionPicker({ onPick }: { onPick: (side: PlayerFaction) => void }) {
  return (
    <div className="faction-picker">
      <button className="pick-side aegis" onClick={() => onPick('aegis')}>
        <Shield size={44} />
        <span>DEFENSIVE NETWORK</span>
        <h3>AEGIS COALITION</h3>
        <p>Hold logistics, defend strategic infrastructure and counterattack contested sectors.</p>
        <b>JOIN AEGIS <ChevronRight size={17} /></b>
      </button>
      <div className="versus">VS</div>
      <button className="pick-side vanguard" onClick={() => onPick('vanguard')}>
        <Crosshair size={44} />
        <span>OFFENSIVE NETWORK</span>
        <h3>VANGUARD PACT</h3>
        <p>Maintain pressure, break strongpoints and expand the frontline across the theater.</p>
        <b>JOIN VANGUARD <ChevronRight size={17} /></b>
      </button>
    </div>
  )
}
