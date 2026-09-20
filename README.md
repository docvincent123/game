# FRONTLINE: WORLD

Browser-first persistent war prototype built for fast testing on weak PCs.

## v0.2 prototype

This version deliberately uses **no WebSocket server and no voice rooms yet**. The goal is to test the core loop, UI and player flow before adding backend complexity.

### Included now

- animated entry screen and radar
- fictional global war map
- Aegis Coalition vs Vanguard Pact
- selectable sectors with ownership and influence
- contested sectors with animated frontline effects
- local sector reinforcement / capture simulation
- simulated war updates
- war event feed
- faction selection stored in localStorage
- HQ role selection stored in localStorage
- player callsign + local profile
- local-only HQ text chat mock
- faction stats and mock leaderboard
- retained tactical RTS test range from v0.1
- responsive desktop/mobile layouts
- GitHub Actions production build

## Local run

```bash
npm install
npm run dev
```

## Test loop

1. Enter the War Room.
2. Choose Aegis or Vanguard.
3. Click a contested sector.
4. Press **Join Operation** to move influence for your faction.
5. Use **Simulate Front Update** to generate mock global changes.
6. Open **HQ** and assign yourself a role.
7. Change your callsign in **Profile**.
8. Open **Tactical Test** to use the original RTS sandbox.

All current progress is local to the browser and can be reset from Profile.

## Planned after the prototype feels good

1. real backend + accounts
2. PostgreSQL persistence
3. live WebSocket frontline updates
4. real faction/clan systems
5. real HQ text channels
6. voice command rooms
7. scheduled operations and seasons
8. browser tactical battles tied to the global map
9. moderation / reports / commander reputation

**FRONTLINE: WORLD — Every battle moves the front.**
