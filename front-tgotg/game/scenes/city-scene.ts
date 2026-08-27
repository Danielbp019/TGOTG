import Phaser from 'phaser'
import { EventBus } from '@/game/event-bus'
import {
  buildingAssetPath,
  groundAsset,
} from '@/game/assets'
import { getCityBuildings, getWorldSize } from '@/game/city-data'
import type { PlotShape } from '@/types'

interface CitySlot {
  type: string
  name: string
  level: number
  damage: number
  upgrading: boolean
  x: number
  y: number
  shape: PlotShape
  width: number
  height: number
}

function toSlots(buildings: ReturnType<typeof getCityBuildings>): CitySlot[] {
  return buildings.map((building) => ({
    type: building.key,
    name: building.name,
    level: building.level,
    damage: building.damage ?? 0,
    upgrading: building.upgrading ?? false,
    x: building.x,
    y: building.y,
    shape: building.shape,
    width: building.width,
    height: building.height,
  }))
}

export class CityScene extends Phaser.Scene {
  private readonly spriteSize = 1024

  private static readonly DEBUG_STEP = 128

  private static readonly DEBUG_LABEL_STEP = 256

  private static readonly DEBUG_DEPTH = 999_999

  private gridVisible = false

  private gridContainer?: Phaser.GameObjects.Container

  private plotsVisible = false

  private plotContainer?: Phaser.GameObjects.Container

  private debugPointerLabel?: Phaser.GameObjects.Text

  constructor() {
    super('CityScene')
  }

  preload() {
    this.load.image('ground', groundAsset)
    const buildings = getCityBuildings()
    for (const building of buildings) {
      const path = buildingAssetPath(
        building.key,
        building.level,
        building.damage ?? 0,
        { upgrading: building.upgrading ?? false }
      )
      if (path && !this.textures.exists(path)) {
        this.load.image(path, path)
      }
    }
  }

  create() {
    const ws = getWorldSize()
    this.cameras.main.setBackgroundColor('#1e2a1e')
    this.add.image(ws.width / 2, ws.height / 2, 'ground')

    const slots = toSlots(getCityBuildings()).sort((a, b) => a.y - b.y)
    this.createBuildings(slots)

    this.setupDebugTools()

    EventBus.emit('current-scene-ready', this)
  }

  private setupDebugTools() {
    this.input.keyboard?.on('keydown-O', () => {
      if (this.gridVisible) {
        this.hideGridOverlay()
      } else {
        this.showGridOverlay()
      }
    })

    this.input.keyboard?.on('keydown-P', () => {
      if (this.plotsVisible) {
        this.hidePlotOverlay()
      } else {
        this.showPlotOverlay()
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updateDebugPointerLabel(pointer)
    })

    this.events.once('shutdown', () => {
      this.gridVisible = false
      this.gridContainer = undefined
      this.plotsVisible = false
      this.plotContainer = undefined
      this.debugPointerLabel = undefined
    })
  }

  /** Rejilla cartesiana con etiquetas de coordenadas (tecla O). */
  private showGridOverlay() {
    const ws = getWorldSize()
    const { DEBUG_STEP, DEBUG_LABEL_STEP, DEBUG_DEPTH } = CityScene

    const items: Phaser.GameObjects.GameObject[] = []

    const grid = this.add.graphics().setDepth(DEBUG_DEPTH)

    grid.lineStyle(1, 0x00ffcc, 0.6)
    for (let x = 0; x <= ws.width; x += DEBUG_STEP) {
      grid.lineBetween(x, 0, x, ws.height)
    }
    for (let y = 0; y <= ws.height; y += DEBUG_STEP) {
      grid.lineBetween(0, y, ws.width, y)
    }

    grid.lineStyle(2, 0xff5555, 0.65)
    grid.lineBetween(0, 0, 0, ws.height)
    grid.lineBetween(0, 0, ws.width, 0)

    items.push(grid)

    for (let x = 0; x <= ws.width; x += DEBUG_LABEL_STEP) {
      for (let y = 0; y <= ws.height; y += DEBUG_LABEL_STEP) {
        const label = this.add
          .text(x, y, `${x}, ${y}`, {
            color: '#7dffe0',
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 4, y: 2 },
          })
          .setOrigin(0, 1)
          .setDepth(DEBUG_DEPTH)
        items.push(label)
      }
    }

    this.gridContainer = this.add.container(0, 0, items)
    this.gridVisible = true
  }

  private hideGridOverlay() {
    this.gridContainer?.destroy()
    this.gridContainer = undefined
    this.gridVisible = false
  }

  /** Contornos de parcelas y lectura del puntero (tecla P). */
  private showPlotOverlay() {
    const DEBUG_DEPTH = CityScene.DEBUG_DEPTH

    const items: Phaser.GameObjects.GameObject[] = []

    this.addSpriteOutlines(items)

    const pointerLabel = this.add
      .text(10, 10, 'x: 0  y: 0', {
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setDepth(DEBUG_DEPTH)
    items.push(pointerLabel)
    this.debugPointerLabel = pointerLabel

    this.plotContainer = this.add.container(0, 0, items)
    this.plotsVisible = true
  }

  private hidePlotOverlay() {
    this.plotContainer?.destroy()
    this.plotContainer = undefined
    this.debugPointerLabel = undefined
    this.plotsVisible = false
  }

  /** Contorno de cada parcela con su tipo/coordenadas y el ancla del sprite. */
  private addSpriteOutlines(items: Phaser.GameObjects.GameObject[]) {
    const DEBUG_DEPTH = CityScene.DEBUG_DEPTH

    const outlines = this.add.graphics().setDepth(DEBUG_DEPTH)
    outlines.lineStyle(2, 0xffd54a, 0.9)
    outlines.fillStyle(0xffd54a, 0.9)

    const slots = toSlots(getCityBuildings())

    slots.forEach((slot) => {
      const left = slot.x - slot.width / 2
      const top = slot.y - slot.height

      outlines.strokeRect(left, top, slot.width, slot.height)

      // Ancla: punto donde se apoya el sprite (origin 0.5, 1)
      outlines.fillCircle(slot.x, slot.y, 3)
      outlines.lineBetween(slot.x - 8, slot.y, slot.x + 8, slot.y)
      outlines.lineBetween(slot.x, slot.y - 8, slot.x, slot.y + 8)

      const label = this.add
        .text(left, top - 4, `${slot.type} (${slot.x}, ${slot.y})`, {
          color: '#ffe08a',
          fontFamily: 'monospace',
          fontSize: '18px',
          backgroundColor: '#00000088',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0, 1)
        .setDepth(DEBUG_DEPTH)
      items.push(label)
    })

    items.push(outlines)
  }

  private updateDebugPointerLabel(pointer: Phaser.Input.Pointer) {
    if (!this.debugPointerLabel?.active) return

    this.debugPointerLabel.setText(
      `x: ${Math.round(pointer.worldX)}  y: ${Math.round(pointer.worldY)}`
    )
  }

  private buildingScale(slot: CitySlot): number {
    if (slot.shape === 'diamond') {
      const byWidth = (slot.width * 0.88) / this.spriteSize
      const byHeight = (slot.height * 1.65) / this.spriteSize
      return Phaser.Math.Clamp(Math.min(byWidth, byHeight), 0.26, 0.34)
    }
    const byWidth = (slot.width * 0.62) / this.spriteSize
    const byHeight = (slot.height * 2.4) / this.spriteSize
    return Phaser.Math.Clamp(Math.min(byWidth, byHeight), 0.2, 0.36)
  }

  private createBuildings(slots: CitySlot[]) {
    slots.forEach((slot) => {
      const assetPath = buildingAssetPath(slot.type, slot.level, slot.damage, {
        upgrading: slot.upgrading,
      })
      const hasSprite = !!assetPath && this.textures.exists(assetPath)

      if (!hasSprite && slot.level === 0 && !slot.upgrading) return

      if (hasSprite && assetPath) {
        const scale = this.buildingScale(slot)
        const image = this.add
          .image(0, 0, assetPath)
          .setOrigin(0.5, 1)
          .setScale(scale)
        const container = this.add.container(slot.x, slot.y, [image])
        container.setDepth(slot.y)
        return
      }

      const placeholder = this.createDefensivePlaceholder(slot)
      placeholder.setDepth(slot.y)
    })
  }

  private createDefensivePlaceholder(
    slot: CitySlot
  ): Phaser.GameObjects.Container {
    const graphics = this.add.graphics()
    const w = slot.width * 0.62
    const h = slot.height * 0.92
    const halfW = w / 2
    graphics.fillStyle(0x3a4a3a, 0.22)
    graphics.fillRect(-halfW, -h, w, h)
    graphics.lineStyle(2, 0x8b7d6b, 0.32)
    graphics.strokeRect(-halfW, -h, w, h)

    const label = this.add
      .text(0, -h / 2, `${slot.name}\nNivel ${slot.level}`, {
        color: '#e8e8e8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        align: 'center',
      })
      .setOrigin(0.5)

    return this.add.container(slot.x, slot.y, [graphics, label])
  }
}
