import Phaser from 'phaser'

type Team = 'blue' | 'red'
type UnitType = 'tank' | 'infantry' | 'recon' | 'artillery' | 'air-defense' | 'helicopter'

type TacticalUnit = {
  container: Phaser.GameObjects.Container
  selection: Phaser.GameObjects.Graphics
  team: Team
  type: UnitType
  hp: number
  speed: number
  range: number
  damage: number
  target?: Phaser.Math.Vector2
  lastShot: number
}

export class FrontlineScene extends Phaser.Scene {
  private units: TacticalUnit[] = []
  private selected: TacticalUnit[] = []
  private dragStart?: Phaser.Math.Vector2
  private selectionBox?: Phaser.GameObjects.Graphics
  private keys?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>
  private aiTick = 0

  constructor() {
    super('frontline')
  }

  create() {
    this.cameras.main.setBounds(0, 0, 3200, 2000)
    this.cameras.main.centerOn(1550, 1000)
    this.cameras.main.setZoom(0.72)
    this.input.mouse?.disableContextMenu()

    this.drawMap()
    this.spawnForces()

    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) {
        this.dragStart = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY)
      }

      if (pointer.button === 2 && this.selected.length) {
        this.issueMove(pointer.worldX, pointer.worldY)
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragStart || !pointer.leftButtonDown()) return
      const x1 = Math.min(this.dragStart.x, pointer.worldX)
      const y1 = Math.min(this.dragStart.y, pointer.worldY)
      const x2 = Math.max(this.dragStart.x, pointer.worldX)
      const y2 = Math.max(this.dragStart.y, pointer.worldY)

      if (!this.selectionBox) this.selectionBox = this.add.graphics().setDepth(50)
      this.selectionBox.clear()
      this.selectionBox.fillStyle(0x72ffd0, 0.08)
      this.selectionBox.lineStyle(2, 0x72ffd0, 0.8)
      this.selectionBox.fillRect(x1, y1, x2 - x1, y2 - y1)
      this.selectionBox.strokeRect(x1, y1, x2 - x1, y2 - y1)
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0 || !this.dragStart) return

      const start = this.dragStart
      const end = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY)
      const dragDistance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y)

      if (dragDistance < 12) {
        const clicked = this.units
          .filter((u) => u.team === 'blue' && u.container.active)
          .find((u) => Phaser.Math.Distance.Between(u.container.x, u.container.y, end.x, end.y) < 34)
        this.setSelected(clicked ? [clicked] : [])
      } else {
        const rect = new Phaser.Geom.Rectangle(
          Math.min(start.x, end.x),
          Math.min(start.y, end.y),
          Math.abs(end.x - start.x),
          Math.abs(end.y - start.y),
        )
        this.setSelected(
          this.units.filter((u) => u.team === 'blue' && u.container.active && rect.contains(u.container.x, u.container.y)),
        )
      }

      this.dragStart = undefined
      this.selectionBox?.clear()
    })

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _go: unknown, _dx: number, dy: number) => {
      const camera = this.cameras.main
      const oldZoom = camera.zoom
      const newZoom = Phaser.Math.Clamp(oldZoom - dy * 0.001, 0.42, 1.55)
      const before = camera.getWorldPoint(pointer.x, pointer.y)
      camera.setZoom(newZoom)
      const after = camera.getWorldPoint(pointer.x, pointer.y)
      camera.scrollX += before.x - after.x
      camera.scrollY += before.y - after.y
    })
  }

  update(_time: number, delta: number) {
    const camera = this.cameras.main
    const pan = 620 * (delta / 1000) / camera.zoom
    if (this.keys?.W.isDown) camera.scrollY -= pan
    if (this.keys?.S.isDown) camera.scrollY += pan
    if (this.keys?.A.isDown) camera.scrollX -= pan
    if (this.keys?.D.isDown) camera.scrollX += pan

    for (const unit of this.units) {
      if (!unit.container.active || !unit.target) continue
      const d = Phaser.Math.Distance.Between(unit.container.x, unit.container.y, unit.target.x, unit.target.y)
      if (d < 5) {
        unit.target = undefined
        continue
      }
      const step = Math.min(unit.speed * (delta / 1000), d)
      const angle = Phaser.Math.Angle.Between(unit.container.x, unit.container.y, unit.target.x, unit.target.y)
      unit.container.x += Math.cos(angle) * step
      unit.container.y += Math.sin(angle) * step
    }

    this.aiTick += delta
    if (this.aiTick > 950) {
      this.aiTick = 0
      this.runEnemyAI()
    }

    this.processCombat()
    this.units = this.units.filter((u) => u.container.active)
    this.selected = this.selected.filter((u) => u.container.active)
  }

  private drawMap() {
    const g = this.add.graphics().setDepth(-10)
    g.fillStyle(0x08130f, 1)
    g.fillRect(0, 0, 3200, 2000)

    g.lineStyle(1, 0x173127, 0.45)
    for (let x = 0; x <= 3200; x += 100) g.lineBetween(x, 0, x, 2000)
    for (let y = 0; y <= 2000; y += 100) g.lineBetween(0, y, 3200, y)

    g.fillStyle(0x10251b, 0.95)
    ;[
      [180, 180, 650, 420],
      [2200, 220, 720, 420],
      [420, 1250, 780, 480],
      [2100, 1230, 760, 500],
    ].forEach(([x, y, w, h]) => g.fillRoundedRect(x, y, w, h, 80))

    g.lineStyle(64, 0x1b211e, 1)
    g.beginPath()
    g.moveTo(80, 1050)
    g.lineTo(900, 900)
    g.lineTo(1620, 1010)
    g.lineTo(2300, 810)
    g.lineTo(3140, 940)
    g.strokePath()

    g.lineStyle(6, 0x5f655d, 0.45)
    g.beginPath()
    g.moveTo(80, 1050)
    g.lineTo(900, 900)
    g.lineTo(1620, 1010)
    g.lineTo(2300, 810)
    g.lineTo(3140, 940)
    g.strokePath()

    g.fillStyle(0x202923, 1)
    g.fillRoundedRect(1320, 670, 530, 430, 30)
    g.fillStyle(0x2a332d, 1)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        g.fillRect(1370 + col * 92, 720 + row * 88, 54, 52)
      }
    }

    this.add.text(1450, 620, 'NOVYI KRAI', {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#64786d',
      letterSpacing: 5,
    }).setDepth(-5)

    this.drawCapturePoint(720, 980, 'A')
    this.drawCapturePoint(1590, 920, 'B')
    this.drawCapturePoint(2440, 860, 'C')
  }

  private drawCapturePoint(x: number, y: number, label: string) {
    const marker = this.add.graphics().setDepth(-2)
    marker.lineStyle(5, 0x78ffd1, 0.4)
    marker.strokeCircle(x, y, 72)
    marker.lineStyle(2, 0x78ffd1, 0.18)
    marker.strokeCircle(x, y, 92)
    this.add.text(x, y, label, {
      fontFamily: 'Arial Black',
      fontSize: '30px',
      color: '#7effd4',
    }).setOrigin(0.5).setAlpha(0.5)
  }

  private spawnForces() {
    this.createUnit(430, 1030, 'blue', 'recon', 'R-01')
    this.createUnit(520, 1090, 'blue', 'tank', 'A-11')
    this.createUnit(580, 1010, 'blue', 'tank', 'A-12')
    this.createUnit(470, 1160, 'blue', 'infantry', 'I-21')
    this.createUnit(360, 1220, 'blue', 'artillery', 'F-30')
    this.createUnit(620, 1180, 'blue', 'air-defense', 'AD-4')
    this.createUnit(720, 1260, 'blue', 'helicopter', 'H-7')

    this.createUnit(2700, 810, 'red', 'recon', 'R-91')
    this.createUnit(2630, 900, 'red', 'tank', 'T-72')
    this.createUnit(2730, 960, 'red', 'tank', 'T-73')
    this.createUnit(2810, 860, 'red', 'infantry', 'M-12')
    this.createUnit(2920, 1090, 'red', 'artillery', 'G-20')
    this.createUnit(2570, 1040, 'red', 'air-defense', 'SAM')
    this.createUnit(2470, 730, 'red', 'helicopter', 'H-9')
  }

  private createUnit(x: number, y: number, team: Team, type: UnitType, callsign: string) {
    const teamColor = team === 'blue' ? 0x77ffd4 : 0xff756e
    const fill = team === 'blue' ? 0x102c24 : 0x351916
    const body = this.add.graphics()
    body.fillStyle(0x000000, 0.45)
    body.fillRoundedRect(-27, -20, 58, 44, 9)
    body.lineStyle(2, teamColor, 0.9)
    body.fillStyle(fill, 0.95)
    body.fillRoundedRect(-30, -23, 58, 42, 8)
    body.strokeRoundedRect(-30, -23, 58, 42, 8)

    const symbols: Record<UnitType, string> = {
      tank: '◆',
      infantry: '✕',
      recon: '◉',
      artillery: '✦',
      'air-defense': '⌃',
      helicopter: 'H',
    }
    const symbol = this.add.text(-2, -3, symbols[type], {
      fontFamily: 'Arial Black',
      fontSize: type === 'helicopter' ? '17px' : '19px',
      color: team === 'blue' ? '#b7ffe7' : '#ffc0bb',
    }).setOrigin(0.5)

    const label = this.add.text(0, 30, callsign, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      color: team === 'blue' ? '#9fffe0' : '#ffaaa4',
      backgroundColor: '#07100dcc',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5)

    const selection = this.add.graphics()
    selection.lineStyle(2, 0xeaff8b, 0.95)
    selection.strokeCircle(0, 0, 39)
    selection.setVisible(false)

    const container = this.add.container(x, y, [selection, body, symbol, label]).setDepth(10)
    const stats = this.statsFor(type)
    const unit: TacticalUnit = {
      container,
      selection,
      team,
      type,
      hp: stats.hp,
      speed: stats.speed,
      range: stats.range,
      damage: stats.damage,
      lastShot: 0,
    }
    this.units.push(unit)
  }

  private statsFor(type: UnitType) {
    const data = {
      tank: { hp: 160, speed: 92, range: 215, damage: 28 },
      infantry: { hp: 85, speed: 58, range: 145, damage: 12 },
      recon: { hp: 70, speed: 115, range: 185, damage: 8 },
      artillery: { hp: 60, speed: 55, range: 430, damage: 36 },
      'air-defense': { hp: 80, speed: 60, range: 300, damage: 18 },
      helicopter: { hp: 90, speed: 145, range: 250, damage: 20 },
    }
    return data[type]
  }

  private setSelected(units: TacticalUnit[]) {
    this.selected.forEach((u) => u.selection.setVisible(false))
    this.selected = units
    this.selected.forEach((u) => u.selection.setVisible(true))
  }

  private issueMove(x: number, y: number) {
    const columns = Math.ceil(Math.sqrt(this.selected.length))
    this.selected.forEach((unit, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      const ox = (col - (columns - 1) / 2) * 70
      const oy = row * 65
      unit.target = new Phaser.Math.Vector2(x + ox, y + oy)
    })

    const marker = this.add.graphics().setDepth(45)
    marker.lineStyle(3, 0xcfff76, 0.9)
    marker.strokeCircle(x, y, 24)
    marker.lineBetween(x - 34, y, x + 34, y)
    marker.lineBetween(x, y - 34, x, y + 34)
    this.tweens.add({
      targets: marker,
      alpha: 0,
      scale: 1.6,
      duration: 650,
      onComplete: () => marker.destroy(),
    })
  }

  private runEnemyAI() {
    const blues = this.units.filter((u) => u.team === 'blue' && u.container.active)
    const reds = this.units.filter((u) => u.team === 'red' && u.container.active)
    if (!blues.length) return

    for (const red of reds) {
      const target = blues.reduce((best, current) => {
        const db = Phaser.Math.Distance.Between(red.container.x, red.container.y, best.container.x, best.container.y)
        const dc = Phaser.Math.Distance.Between(red.container.x, red.container.y, current.container.x, current.container.y)
        return dc < db ? current : best
      }, blues[0])

      const distance = Phaser.Math.Distance.Between(red.container.x, red.container.y, target.container.x, target.container.y)
      if (distance > red.range * 0.8) {
        red.target = new Phaser.Math.Vector2(target.container.x, target.container.y)
      }
    }
  }

  private processCombat() {
    const now = this.time.now
    for (const attacker of this.units) {
      if (!attacker.container.active || now - attacker.lastShot < 900) continue
      const enemies = this.units.filter((u) => u.team !== attacker.team && u.container.active)
      if (!enemies.length) continue

      let target: TacticalUnit | undefined
      let bestDistance = Number.POSITIVE_INFINITY
      for (const enemy of enemies) {
        const d = Phaser.Math.Distance.Between(attacker.container.x, attacker.container.y, enemy.container.x, enemy.container.y)
        if (d < attacker.range && d < bestDistance) {
          bestDistance = d
          target = enemy
        }
      }
      if (!target) continue

      attacker.lastShot = now
      target.hp -= attacker.damage
      this.drawShot(attacker, target)

      if (target.hp <= 0) {
        this.destroyUnit(target)
      }
    }
  }

  private drawShot(attacker: TacticalUnit, target: TacticalUnit) {
    const tracer = this.add.graphics().setDepth(30)
    const color = attacker.type === 'artillery' ? 0xffd56a : attacker.team === 'blue' ? 0x92ffe0 : 0xff9088
    tracer.lineStyle(attacker.type === 'artillery' ? 5 : 2, color, 0.95)
    tracer.lineBetween(attacker.container.x, attacker.container.y, target.container.x, target.container.y)
    this.tweens.add({
      targets: tracer,
      alpha: 0,
      duration: 150,
      onComplete: () => tracer.destroy(),
    })
  }

  private destroyUnit(unit: TacticalUnit) {
    const x = unit.container.x
    const y = unit.container.y
    unit.container.destroy()

    const blast = this.add.graphics().setDepth(35)
    blast.fillStyle(0xffa84c, 0.85)
    blast.fillCircle(x, y, 18)
    blast.lineStyle(6, 0xff694c, 0.55)
    blast.strokeCircle(x, y, 30)
    this.tweens.add({
      targets: blast,
      alpha: 0,
      scale: 2.3,
      duration: 500,
      onComplete: () => blast.destroy(),
    })
  }
}