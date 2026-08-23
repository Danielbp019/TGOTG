import Phaser from 'phaser'
import { EventBus } from '@/game/event-bus'
import {
  allInteriorAssetPaths,
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

function toSlots(
  buildings: ReturnType<typeof getCityBuildings>
): CitySlot[] {
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

  constructor() {
    super('CityScene')
  }

  preload() {
    this.load.image('ground', groundAsset)
    for (const path of allInteriorAssetPaths()) {
      if (!this.textures.exists(path)) {
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

    EventBus.emit('current-scene-ready', this)
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
        const image = this.add.image(0, 0, assetPath).setOrigin(0.5, 1).setScale(scale)
        const container = this.add.container(slot.x, slot.y, [image])
        container.setDepth(slot.y)
        return
      }

      const placeholder = this.createDefensivePlaceholder(slot)
      placeholder.setDepth(slot.y)
    })
  }

  private createDefensivePlaceholder(slot: CitySlot): Phaser.GameObjects.Container {
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
