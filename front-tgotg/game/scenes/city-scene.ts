import Phaser from 'phaser'
import { EventBus } from '@/game/event-bus'
import { buildingAssets, groundAsset } from '@/game/assets'
import { getCityBuildings } from '@/game/city-data'
import type { PlotShape } from '@/types'

interface CitySlot {
  type: string
  name: string
  level: number
  x: number
  y: number
  shape: PlotShape
  width: number
  height: number
}

function toSlots(
  buildings: ReturnType<typeof getCityBuildings>
): CitySlot[] {
  return buildings.map((building) => ({
    type: building.key,
    name: building.name,
    level: building.level,
    x: building.x,
    y: building.y,
    shape: building.shape,
    width: building.width,
    height: building.height,
  }))
}

export class CityScene extends Phaser.Scene {
  private readonly worldWidth = 2048
  private readonly worldHeight = 1024
  private readonly maxStars = 5
  private readonly skewY = 0.12
  private readonly placeholderSizes = {
    rect: { width: 420, height: 90 },
    diamond: { width: 220, height: 140 },
  } as const

  private tooltip?: Phaser.GameObjects.Container

  constructor() {
    super('CityScene')
  }

  preload() {
    this.load.image('ground', groundAsset)

    ;(
      Object.keys(buildingAssets) as Array<keyof typeof buildingAssets>
    ).forEach((type) => {
      this.load.image(type, buildingAssets[type])
    })
  }

  create() {
    this.cameras.main.setBackgroundColor('#1e2a1e')

    this.add.image(this.worldWidth / 2, this.worldHeight / 2, 'ground')

    const buildings = getCityBuildings()
    const slots = toSlots(buildings)

    this.createPlots(slots)
    this.createBuildings(slots)
    this.createTooltip()

    EventBus.emit('current-scene-ready', this)
  }

  private createPlots(slots: CitySlot[]) {
    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0x8b7d6b, 0.45)

    slots.forEach((slot) => {
      const x = slot.x
      const y = slot.y
      const halfW = slot.width / 2
      const halfH = slot.height / 2

      let points: number[][]
      if (slot.shape === 'rect') {
        points = [
          [x - halfW, y],
          [x + halfW, y],
          [x + halfW, y - slot.height],
          [x - halfW, y - slot.height],
        ]
      } else {
        points = [
          [x, y - slot.height],
          [x + halfW, y - halfH],
          [x, y],
          [x - halfW, y - halfH],
        ]
      }

      const sheared = points.map(([px, py]) => this.shearPoint(px, py, x))

      graphics.beginPath()
      sheared.forEach(([px, py], index) => {
        if (index === 0) {
          graphics.moveTo(px, py)
        } else {
          graphics.lineTo(px, py)
        }
      })
      graphics.closePath()
      graphics.strokePath()
    })
  }

  /** Aplica un shear vertical: la esquina izquierda sube y la derecha baja (perspectiva isométrica). */
  private shearPoint(px: number, py: number, cx: number): [number, number] {
    const dx = px - cx
    return [px, py + this.skewY * dx]
  }

  private createBuildings(slots: CitySlot[]) {
    slots.forEach((slot) => {
      const x = slot.x
      const y = slot.y
      const hasSprite = this.textures.exists(slot.type)

      let building: Phaser.GameObjects.Container

      if (hasSprite) {
        const image = this.add
          .image(0, 0, slot.type)
          .setOrigin(0.5, 1)
          .setScale(slot.shape === 'rect' ? 0.18 : 0.5)
        building = this.add.container(x, y, [image])
        building.setSize(
          slot.shape === 'rect' ? slot.width : slot.width * 0.6,
          slot.shape === 'rect' ? slot.height : slot.height * 0.7
        )
      } else {
        const size = this.placeholderSizes[slot.shape]
        const graphics = this.add.graphics()
        const points = this.placeholderPoints(size.width, size.height)

        graphics.fillStyle(0x2c3e2c, 0.7)
        graphics.fillPoints(points, true)
        graphics.lineStyle(2, 0x8b7d6b)
        graphics.strokePoints(points, true, true)

        const label = this.add
          .text(0, -size.height / 2, slot.name, {
            color: '#e8e8e8',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
          })
          .setOrigin(0.5)

        building = this.add.container(x, y, [graphics, label])
        building.setSize(size.width, size.height)
      }

      building.setData('slot', slot)
      building.setData('hasSprite', hasSprite)
      building.setInteractive({ useHandCursor: true })

      building.on('pointerover', () => this.showBuilding(building))
      building.on('pointerout', () => this.hideBuilding(building))
    })
  }

  /** Vértices de un placeholder de w×h con base en y=0, con shear vertical (izquierda arriba, derecha abajo). */
  private placeholderPoints(
    width: number,
    height: number
  ): Phaser.Math.Vector2[] {
    const halfW = width / 2
    const points: Array<[number, number]> = [
      [-halfW, 0],
      [halfW, 0],
      [halfW, -height],
      [-halfW, -height],
    ]
    return points.map(
      ([px, py]) => new Phaser.Math.Vector2(px, py + this.skewY * px)
    )
  }

  private showBuilding(building: Phaser.GameObjects.Container) {
    if (building.getData('hasSprite')) {
      building.setAlpha(0.85)
    }
    const slot = building.getData('slot') as CitySlot
    const hasSprite = building.getData('hasSprite') as boolean
    const height = hasSprite
      ? slot.height
      : this.placeholderSizes[slot.shape].height
    this.showTooltip(slot, building.x, building.y - height - 60)
  }

  private hideBuilding(building: Phaser.GameObjects.Container) {
    building.setAlpha(1)
    this.hideTooltip()
  }

  private createTooltip() {
    this.tooltip = this.add.container(0, 0)
    this.tooltip.setDepth(100)
    this.tooltip.setVisible(false)
  }

  private showTooltip(slot: CitySlot, x: number, y: number) {
    if (!this.tooltip) return

    const stars = '★'.repeat(Math.min(slot.level, this.maxStars))
    const emptyStars = '☆'.repeat(this.maxStars - stars.length)

    const text = this.add
      .text(0, 0, `${slot.name}\nNivel ${slot.level}\n${stars}${emptyStars}`, {
        color: '#f5efe0',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        align: 'center',
      })
      .setOrigin(0.5)

    const padding = 20
    const background = this.add
      .rectangle(
        0,
        0,
        text.width + padding * 2,
        text.height + padding * 2,
        0x1a241a,
        0.92
      )
      .setStrokeStyle(2, 0x8b7d6b)

    this.tooltip.add([background, text])

    const clampedX = Phaser.Math.Clamp(
      x,
      background.width / 2 + 10,
      this.worldWidth - background.width / 2 - 10
    )
    const clampedY = Phaser.Math.Clamp(
      y,
      background.height / 2 + 10,
      this.worldHeight - background.height / 2 - 10
    )

    this.tooltip.setPosition(clampedX, clampedY)
    this.tooltip.setVisible(true)
  }

  private hideTooltip() {
    this.tooltip?.removeAll(true)
    this.tooltip?.setVisible(false)
  }
}
