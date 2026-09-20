export type FactionId = 'aegis' | 'vanguard' | 'neutral'

export type Sector = {
  id: string
  name: string
  x: number
  y: number
  owner: FactionId
  aegis: number
  vanguard: number
  players: number
  contested: boolean
  terrain: string
  value: number
}

export const sectorsSeed: Sector[] = [
  { id: 'A1', name: 'Northwatch', x: 140, y: 120, owner: 'aegis', aegis: 88, vanguard: 12, players: 18, contested: false, terrain: 'Highlands', value: 2 },
  { id: 'A2', name: 'Cold Ridge', x: 300, y: 90, owner: 'aegis', aegis: 79, vanguard: 21, players: 24, contested: false, terrain: 'Mountains', value: 2 },
  { id: 'B1', name: 'Iron Valley', x: 185, y: 255, owner: 'aegis', aegis: 65, vanguard: 35, players: 41, contested: true, terrain: 'Industrial', value: 3 },
  { id: 'B2', name: 'Karsten', x: 360, y: 220, owner: 'aegis', aegis: 56, vanguard: 44, players: 53, contested: true, terrain: 'Urban', value: 4 },
  { id: 'B3', name: 'Redwood Pass', x: 510, y: 130, owner: 'neutral', aegis: 49, vanguard: 51, players: 67, contested: true, terrain: 'Forest', value: 3 },
  { id: 'C1', name: 'Delta Port', x: 210, y: 410, owner: 'aegis', aegis: 72, vanguard: 28, players: 28, contested: false, terrain: 'Coast', value: 4 },
  { id: 'C2', name: 'Novyi Krai', x: 420, y: 365, owner: 'neutral', aegis: 51, vanguard: 49, players: 84, contested: true, terrain: 'City', value: 5 },
  { id: 'C3', name: 'Grey Marsh', x: 595, y: 290, owner: 'vanguard', aegis: 38, vanguard: 62, players: 46, contested: true, terrain: 'Wetlands', value: 2 },
  { id: 'C4', name: 'Orion Airfield', x: 715, y: 155, owner: 'vanguard', aegis: 22, vanguard: 78, players: 31, contested: false, terrain: 'Airfield', value: 5 },
  { id: 'D1', name: 'South Gate', x: 360, y: 515, owner: 'aegis', aegis: 68, vanguard: 32, players: 22, contested: false, terrain: 'Plains', value: 2 },
  { id: 'D2', name: 'Broken Line', x: 575, y: 470, owner: 'neutral', aegis: 47, vanguard: 53, players: 71, contested: true, terrain: 'Trenches', value: 3 },
  { id: 'D3', name: 'Black Quarry', x: 735, y: 375, owner: 'vanguard', aegis: 31, vanguard: 69, players: 36, contested: false, terrain: 'Quarry', value: 3 },
  { id: 'E1', name: 'Vega Station', x: 775, y: 520, owner: 'vanguard', aegis: 17, vanguard: 83, players: 20, contested: false, terrain: 'Rail Hub', value: 4 },
  { id: 'E2', name: 'Eastwall', x: 875, y: 260, owner: 'vanguard', aegis: 9, vanguard: 91, players: 15, contested: false, terrain: 'Fortress', value: 5 },
]

export const sectorLinks: Array<[string, string]> = [
  ['A1', 'A2'], ['A1', 'B1'], ['A2', 'B2'], ['A2', 'B3'],
  ['B1', 'B2'], ['B1', 'C1'], ['B2', 'B3'], ['B2', 'C2'],
  ['B3', 'C3'], ['B3', 'C4'], ['C1', 'C2'], ['C1', 'D1'],
  ['C2', 'C3'], ['C2', 'D1'], ['C2', 'D2'], ['C3', 'C4'],
  ['C3', 'D2'], ['C3', 'D3'], ['C4', 'E2'], ['D1', 'D2'],
  ['D2', 'D3'], ['D2', 'E1'], ['D3', 'E1'], ['D3', 'E2'],
]

export const initialEvents: Array<{ time: string; side: FactionId; text: string }> = [
  { time: '11:42', side: 'aegis', text: 'Aegis forces reinforced Novyi Krai.' },
  { time: '11:39', side: 'vanguard', text: 'Vanguard opened an assault on Broken Line.' },
  { time: '11:33', side: 'neutral', text: 'Redwood Pass became contested.' },
  { time: '11:27', side: 'aegis', text: 'Delta Port supply route restored.' },
]

export const roles = [
  { id: 'commander', name: 'Field Commander', slots: '1/1', desc: 'Sets priorities and strategic orders.' },
  { id: 'armor', name: 'Armor Command', slots: '3/6', desc: 'Coordinates armored spearheads.' },
  { id: 'infantry', name: 'Infantry Command', slots: '7/12', desc: 'Controls frontline infantry groups.' },
  { id: 'recon', name: 'Recon', slots: '2/5', desc: 'Finds contacts and marks enemy movement.' },
  { id: 'artillery', name: 'Fire Support', slots: '2/4', desc: 'Coordinates artillery missions.' },
  { id: 'logistics', name: 'Logistics', slots: '1/4', desc: 'Keeps sectors supplied and reinforced.' },
]
